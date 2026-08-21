package com.ticket.notification.dto;
import lombok.Data;
@Data
public class OtpVerificationRequest { private String mobileNumber; private String otpCode; }