package com.recycling.dto;

import java.util.List;

public record PythonCrawResponse(
    String status,
    List<PythonGetProductDto> data
) {
    
}
