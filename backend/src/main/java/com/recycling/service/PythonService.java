package com.recycling.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import com.recycling.dto.MatchRequest;
import com.recycling.dto.PythonResponeDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class PythonService {
 
    private final WebClient pyClient;

    public Mono<PythonResponeDto> submitPythonAnalyst(String productName){
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("product_name", productName);
        
        return pyClient.post()
                .uri("http://python:8000/api/v1/match-product")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new MatchRequest(productName))
                .retrieve()
                .bodyToMono(PythonResponeDto.class)
                .doOnError(e -> {log.error("[submitPythonAnalyst] 처리중 에러 발생 : {}",e);});
    }
}
