package com.recycling.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PythonResponeDto(
    List<String> materials,
    String description
) {}
