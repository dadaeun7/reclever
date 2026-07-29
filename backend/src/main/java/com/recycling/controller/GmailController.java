package com.recycling.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.recycling.global.annotaion.LoginUser;
import com.recycling.service.GmailProcessingService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class GmailController {
    
    private final GmailProcessingService gmailProcessingService;

    @PostMapping("/get/gmail")
    public Mono<Void> getGmail(@LoginUser String email){
        return gmailProcessingService.startGetRecycleInfo(email);
    }
}
