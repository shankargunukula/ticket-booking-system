package com.ticket.notification.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OtpRequest {
    private String phoneNumber;
}
