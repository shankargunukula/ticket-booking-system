package com.ticket.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.TimeUnit;
@Service
public class OtpManagementService {
    @Autowired private StringRedisTemplate redisTemplate;
    public String generateAndSendOtp(String phoneNumber) {
        String otp = String.format("%04d", new Random().nextInt(10000));
        redisTemplate.opsForValue().set(phoneNumber, otp, 5, TimeUnit.MINUTES);
        System.out.println("SMS sent to " + phoneNumber + ": " + otp);
        return otp;
    }
    public boolean verifyOtp(String phoneNumber, String code) {
        String cachedOtp = redisTemplate.opsForValue().get(phoneNumber);
        if (cachedOtp != null && cachedOtp.equals(code)) { redisTemplate.delete(phoneNumber); return true; }
        return false;
    }
}