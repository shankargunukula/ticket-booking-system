package com.ticket.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    // Reads secret directly out of application.yml injection profiles safely
    @Value("${jwt.secret:YOUR_SUPER_LONG_SECRET_KEY_MUST_BE_AT_LEAST_32_BYTES_LONG!}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 Hours default fallback
    private long expirationTime;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username, Map<String, Object> claims) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 🚀 FIXED: Rewritten using JJWT 0.12.x standard .parser() configuration syntax
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload(); // .getPayload() replaces old deprecated .getBody() method
    }

    public boolean isTokenValid(String token) {
        try {
            return extractAllClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String generateJwtTokenAfterLdapSuccess(String ldapUsername) {
        long expirationTimeMs = 3600000; // 1 hour expiration window
        SecretKey key = Keys.hmacShaKeyFor("YOUR_SUPER_SECRET_STRONG_KEY_HERE_MUST_BE_32_BYTES_LONG".getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(ldapUsername)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTimeMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
