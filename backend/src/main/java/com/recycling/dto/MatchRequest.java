package com.recycling.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MatchRequest(
    @JsonProperty("product_name") 
    String productName
) {
}
