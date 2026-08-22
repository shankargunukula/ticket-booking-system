package com.ticket.notification.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/otp") // 👈 Must match this prefix exactly
public class OtpController {

    @PostMapping("/generate") // 👈 Must match this endpoint name exactly
    public org.springframework.http.ResponseEntity<String> generateOtp(@RequestBody Object request) {
        // Your execution logic
        return org.springframework.http.ResponseEntity.ok("OTP Dispatched");
    }
}
