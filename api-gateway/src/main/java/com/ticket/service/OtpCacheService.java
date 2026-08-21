package com.ticket.service;

import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
public class OtpCacheService {

    // Change the class type to the auto-configured String variant
    private final ReactiveStringRedisTemplate redisTemplate;
    private static final String PREFIX = "OTP:";

    public OtpCacheService(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Mono<Boolean> saveOtp(String mobileNumber, String otpCode) {
        return redisTemplate.opsForValue()
                .set(PREFIX + mobileNumber, otpCode, Duration.ofMinutes(5));
    }

    public Mono<String> getOtp(String mobileNumber) {
        return redisTemplate.opsForValue().get(PREFIX + mobileNumber);
    }

    public Mono<Boolean> deleteOtp(String mobileNumber) {
        return redisTemplate.opsForValue().delete(PREFIX + mobileNumber);
    }
}
