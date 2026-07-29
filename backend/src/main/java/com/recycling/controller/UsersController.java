package com.recycling.controller;

import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@RestController
public class UsersController {
    
    @PostMapping("/logout")
    public Mono<Void> logout(ServerWebExchange exchange){
        ResponseCookie cookie = ResponseCookie.from("reclever_access_token", "")
            .maxAge(0)
            .path("/")
            .httpOnly(true)
            .secure(true)
            .build();
        
        exchange.getResponse().addCookie(cookie);
        return Mono.empty();
    }

}
