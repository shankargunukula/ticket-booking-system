package com.ticket.notification.dto;
import lombok.Data;
@Data
public class EmailRequest { private String recipient; private String subject; private String body; }