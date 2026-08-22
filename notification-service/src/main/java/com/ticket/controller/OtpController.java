package com.ticket.controller;
import com.ticket.service.OtpManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/otp")
public class OtpController {
    @Autowired private OtpManagementService otpService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateOtp(@RequestBody OtpRequest request) {
        // Extract the field value out of the structured request object safely
        String code = otpService.generateAndSendOtp(request.getPhoneNumber());
        return ResponseEntity.ok("OTP processed successfully.");
    @PostMapping("/verify") public ResponseEntity<Boolean> verifyOtp(@RequestBody java.util.Map<String, String> request) { return ResponseEntity.ok(otpService.verifyOtp(request.get("phoneNumber"), request.get("otpCode"))); }
}