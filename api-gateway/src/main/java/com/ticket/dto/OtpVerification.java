package com.ticket.dto;

import lombok.Data;

@Data
public class OtpVerification {
    private String mobileNumber;
    private String otpCode;
}
