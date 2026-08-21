package com.ticket.notification.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data
@AllArgsConstructor
public class OtpResponse { private boolean verified; private String message; }