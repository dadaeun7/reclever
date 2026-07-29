package com.recycling.dto;

import lombok.Builder;

@Builder
public record GoogleTokenDto(
    String accessToken,
    String refreshToken
) {
}
