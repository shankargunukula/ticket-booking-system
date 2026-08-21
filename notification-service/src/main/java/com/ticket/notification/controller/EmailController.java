package com.ticket.notification.controller;
import com.ticket.notification.dto.EmailRequest;
import com.ticket.notification.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/notifications/email")
public class EmailController {
    private final EmailService emailService;
    public EmailController(EmailService emailService) { this.emailService = emailService; }
    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request) {
        emailService.sendPlainEmail(request.getRecipient(), request.getSubject(), request.getBody());
        return ResponseEntity.ok("Email request queued");
    }
}