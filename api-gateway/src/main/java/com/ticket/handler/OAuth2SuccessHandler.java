package com.ticket.handler;

import com.ticket.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Map;

@Component
public class OAuth2SuccessHandler implements ServerAuthenticationSuccessHandler {

    private final JwtService jwtService;

    public OAuth2SuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        String jwtToken = jwtService.generateToken(email, Map.of("roles", "ROLE_USER", "provider", "GOOGLE"));

        ServerWebExchange exchange = webFilterExchange.getExchange();
        exchange.getResponse().setStatusCode(HttpStatus.FOUND);

        // Pass token to client web app via redirect query string
        exchange.getResponse().getHeaders().setLocation(URI.create("http://localhost:3000/oauth-callback?token=" + jwtToken));

        return exchange.getResponse().setComplete();
    }
}
