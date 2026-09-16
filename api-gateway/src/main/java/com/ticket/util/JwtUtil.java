package com.ticket.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.ldap.userdetails.LdapUserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private static final String SECRET_STRING = "BaseEncodedSecureSigningSecretStringForHMACSHA256AlgorithmsHereMustBeLong!!";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    // ⏳ Configurable Lifespans (in milliseconds)
    private static final long ACCESS_TOKEN_EXPIRATION = 1800000;    // 30 Minutes
    private static final long REFRESH_TOKEN_EXPIRATION = 604800000; // 7 Days (for sliding sessions)

    /**
     * Generates a standard Access Token for authenticating immediate requests.
     */
    public String generateToken(LdapUserDetails ldapUser) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("dn", ldapUser.getDn());
        claims.put("roles", ldapUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        return buildToken(claims, ldapUser.getUsername(), ACCESS_TOKEN_EXPIRATION);
    }

    /**
     * Generates a separate high-lifespan Refresh Token containing minimal payload footprint.
     */
    public String generateRefreshToken(String username) {
        return buildToken(new HashMap<>(), username, REFRESH_TOKEN_EXPIRATION);
    }

    private String buildToken(Map<String, Object> claims, String subject, long expirationMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", List.class));
    }

    /**
     * 🛠️ FIX: Safe verification boundary tool.
     * Catches ExpiredJwtException internally so it no longer causes 500 errors.
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Check if expiration date has crossed the current server timestamp boundary
            return !claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException ex) {
            log.warn("⚠️ JWT validation blocked: Token has expired. Details: {}", ex.getMessage());
            return false; // Returns false safely instead of crashing execution chains!
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("❌ JWT validation failed: Token signature is invalid or malformed.", ex);
            return false;
        }
    }

    /**
     * Directly parses claims out of valid or expired tokens (essential for extracting username from expired sessions).
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claimsResolver.apply(claims);
        } catch (ExpiredJwtException ex) {
            // Allows reading claims out of expired profiles to identify the source user if refreshing sessions
            return claimsResolver.apply(ex.getClaims());
        }
    }
}
