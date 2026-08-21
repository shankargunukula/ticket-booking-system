package com.ticket.notification.service;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.TimeUnit;
@Service
public class OtpManagementService {
    private final StringRedisTemplate redisTemplate;
    private final SmppService smppService;
    public OtpManagementService(StringRedisTemplate redisTemplate, SmppService smppService) {
        this.redisTemplate = redisTemplate; this.smppService = smppService;
    }
    public String generateAndSendOtp(String mobileNumber) {
        String code = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set("OTP:" + mobileNumber, code, 5, TimeUnit.MINUTES);
        smppService.sendSms(mobileNumber, "Your secure validation token is: " + code);
        return code;
    }
    public boolean verifyOtp(String mobileNumber, String userInputCode) {
        String cached = redisTemplate.opsForValue().get("OTP:" + mobileNumber);
        if (cached != null && cached.equals(userInputCode)) {
            redisTemplate.delete("OTP:" + mobileNumber);
            return true;
        }
        return false;
    }
}