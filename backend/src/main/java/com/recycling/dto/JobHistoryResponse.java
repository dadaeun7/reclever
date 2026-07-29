package com.recycling.dto;

import java.time.LocalDateTime;

public record JobHistoryResponse(
    String status,
    LocalDateTime timeStamp
) {
    
}
