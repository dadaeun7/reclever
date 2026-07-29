package com.recycling.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.recycling.dto.RecycleInfoResponse;
import com.recycling.global.annotaion.LoginUser;
import com.recycling.service.RecycleInfoService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class RecycleInfoController {
    
    private final RecycleInfoService recycleInfoService;
    
    @GetMapping("/get/recycle")
    public Flux<RecycleInfoResponse> getRecycleInfo(@LoginUser String email,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate){

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return recycleInfoService.getRecycleInfo(email, start, end);
    }

    @PostMapping("/submit/product")
    public Mono<RecycleInfoResponse> submitProductName(@LoginUser String email, @RequestParam("productName")String productName){
        return recycleInfoService.getOneRecycleInfo(email, productName);
    }
}
