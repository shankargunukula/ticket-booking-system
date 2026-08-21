package com.ticket.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;
import java.util.random.RandomGenerator;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpManagementService {

    private final StringRedisTemplate redisTemplate;
    private final SmppService smppService;

    // Java 21 updated uniform pseudo-random number generator algorithm base interface
    private final RandomGenerator randomizer = RandomGenerator.of("L32X64MixRandom");

    public String generateAndSendOtp(String phoneNumber) {
        String otp = String.format("%04d", randomizer.nextInt(10000));
        redisTemplate.opsForValue().set(phoneNumber, otp, 5, TimeUnit.MINUTES);

        // Uses clean string construction to alert the outbound provider system
        String messagePayload = "Your secure registration log gateway authorization token is: " + otp;
        smppService.sendSms(phoneNumber, messagePayload);

        log.info("Dispatched generation tracing event key tracking parameters for target: {}", phoneNumber);
        return otp;
    }

    public boolean verifyOtp(String phoneNumber, String code) {
        String cachedOtp = redisTemplate.opsForValue().get(phoneNumber);
        if (cachedOtp != null && cachedOtp.equals(code)) {
            redisTemplate.delete(phoneNumber);
            return true;
        }
        return false;
    }
}
