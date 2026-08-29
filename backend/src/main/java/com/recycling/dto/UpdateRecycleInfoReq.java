package com.recycling.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateRecycleInfoReq(
    @JsonProperty("material")
    List<String> material,
    @JsonProperty("description")
    String description
) {}
