package com.ticket.controller;

import com.ticket.dto.AuthResponse;
import com.ticket.dto.OtpRequest;
import com.ticket.dto.OtpVerification;
import com.ticket.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class MobileAuthController {

    private final WebClient.Builder webClientBuilder;
    private final JwtService jwtService;

    @Value("${notification.service.url:http://tbs-notification-service:8082}")
    private String notificationServiceUrl;

    @PostMapping("/login")
    public Mono<ResponseEntity<String>> requestOtp(@RequestBody OtpRequest request) {
        log.info("Processing login routing sequence for mobile entry: {}", request.phoneNumber());

        return webClientBuilder.build()
                .post()
                .uri(notificationServiceUrl + "/api/v1/otp/generate")
                .bodyValue(request)
                .retrieve()
                .toEntity(String.class)
                // 🚀 IMPROVED: Prints the actual network problem directly onto your console logs
                .doOnError(error -> log.error("CRITICAL WEBCLIENT DROP ERROR: {}", error.getMessage()))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Gateway communication pipeline broken."));
    }

    @PostMapping("/verify")
    public Mono<ResponseEntity<AuthResponse>> verifyAndLogin(@RequestBody OtpVerification verification) {
        log.info("Validating entry code handshake mapping for: {}", verification.phoneNumber());

        Map<String, String> payload = Map.of(
                "phoneNumber", verification.phoneNumber(),
                "otpCode", verification.otpCode()
        );

        return webClientBuilder.build()
                .post()
                .uri(notificationServiceUrl + "/api/v1/otp/verify")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(Boolean.class)
                .map(isValid -> {
                    if (Boolean.TRUE.equals(isValid)) {
                        String token = jwtService.generateToken(verification.phoneNumber(), Map.of("role", "ROLE_MOBILE"));
                        return ResponseEntity.ok(new AuthResponse(token, "Authentication handshake completed."));
                    }
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new AuthResponse(null, "Provided OTP code is invalid."));
                });
    }
}
