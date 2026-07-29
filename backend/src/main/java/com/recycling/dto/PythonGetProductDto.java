package com.recycling.dto;

public record PythonGetProductDto(
    String categoryId,
    String productName,
    int collectedPage
){}
