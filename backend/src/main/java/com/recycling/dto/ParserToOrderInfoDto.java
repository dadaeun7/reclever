package com.recycling.dto;

import java.time.ZonedDateTime;

import lombok.Builder;

@Builder
public record ParserToOrderInfoDto(
    String mailId,    
    String productName,
    ZonedDateTime orderTime) {
}
