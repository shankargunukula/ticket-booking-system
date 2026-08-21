package com.ticket.notification.controller;
import com.ticket.notification.dto.*;
import com.ticket.notification.service.OtpManagementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/notifications/otp")
public class OtpController {
    private final OtpManagementService otpManagementService;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OtpController.class);


    public OtpController(OtpManagementService otpManagementService) { this.otpManagementService = otpManagementService; }
    @PostMapping("/send")
    public ResponseEntity<String> sendOtp(@RequestBody OtpRequest request) {
        // This explicit line will print downstream!
        log.info("Notification Service processing OTP generation for payload: {}", request.getMobileNumber());

        otpManagementService.generateAndSendOtp(request.getMobileNumber());
        return ResponseEntity.ok("OTP sent");
    }
    @PostMapping("/verify")
    public ResponseEntity<OtpResponse> verifyOtp(@RequestBody OtpVerificationRequest request) {
        boolean isSuccess = otpManagementService.verifyOtp(request.getMobileNumber(), request.getOtpCode());
        if (isSuccess) return ResponseEntity.ok(new OtpResponse(true, "Verified"));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new OtpResponse(false, "Failed"));
    }
}