package com.recycling.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.recycling.dto.JobHistoryResponse;
import com.recycling.global.annotaion.LoginUser;
import com.recycling.service.JobHistoryService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@RestController
@RequiredArgsConstructor
public class JobHistoryController {
    
    private final JobHistoryService jobHistoryService;


    @GetMapping("/notify/list")
    public Flux<JobHistoryResponse> getNotifyList(@LoginUser String email){
        return jobHistoryService.getLists(email);       
    }
}
