package com.ticket.controller;

import com.ticket.dto.AuthResponse;
import com.ticket.dto.OtpRequest;
import com.ticket.dto.OtpVerification;
import com.ticket.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/auth/otp")
public class MobileAuthController {

    private final WebClient webClient;
    private final JwtService jwtService;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MobileAuthController.class);

    // Injects the downstream microservice URI from your docker-compose environment network
    public MobileAuthController(WebClient.Builder webClientBuilder,
                                @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8082}") String notificationServiceUrl,
                                JwtService jwtService) {
        this.webClient = webClientBuilder.baseUrl(notificationServiceUrl).build();
        this.jwtService = jwtService;
    }

    /**
     * Proxies the phone number request downstream to the Notification Microservice
     */
    @PostMapping("/send")
    public Mono<ResponseEntity<String>> sendOtp(@RequestBody OtpRequest request) {
        // This explicit line will now trigger with your trace ID!
        log.info("API Gateway received OTP request for phone: {}", request.getMobileNumber());

        return webClient.post()
                .uri("/notifications/otp/send")
                .bodyValue(request)
                .retrieve() // Utilises standard non-blocking retrieval channels
                .toEntity(String.class)
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Notification service unreachable."));
    }

    /**
     * Relays token check downstream and issues a secure application JWT on success
     */
    @PostMapping("/verify")
    public Mono<ResponseEntity<AuthResponse>> verifyOtp(@RequestBody OtpVerification verification) {
        return webClient.post()
                .uri("/notifications/otp/verify")
                .bodyValue(verification)
                .retrieve()
                .bodyToMono(Map.class) // Reads verified fields map from notification service response
                .flatMap(responseMap -> {
                    boolean isVerified = (boolean) responseMap.getOrDefault("verified", false);

                    if (isVerified) {
                        // Issue internal application infrastructure access passport token at the gateway edge
                        String token = jwtService.generateToken(
                                verification.getMobileNumber(),
                                Map.of("roles", "ROLE_USER", "provider", "MOBILE")
                        );
                        return Mono.just(ResponseEntity.ok(new AuthResponse(token, verification.getMobileNumber())));
                    }

                    // Invalid/Expired OTP branch scenario
                    return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<AuthResponse>build());
                })
                // Fallback stream logic handles service connectivity drops gracefully
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()));
    }
}
