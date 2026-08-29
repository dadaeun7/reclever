package com.recycling.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;

@Builder
public record RecycleInfoResponse(
    Long id,
    String productName,
    List<String> materilas,
    String description,
    LocalDateTime orderDate,
    Boolean directInput
) {}
