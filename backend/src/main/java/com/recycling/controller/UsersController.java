package com.recycling.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@RestController
public class UsersController {

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site}")
    private String cookieSameSite;

    @Value("${app.cookie.domain:}")
    private String cookieDomain;

    
    @PostMapping("/logout")
    public Mono<Void> logout(ServerWebExchange exchange){
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("reclever_access_token", "")
            .maxAge(0)
            .path("/")
            .httpOnly(true)
            .secure(cookieSecure);
        
        if(cookieSameSite != null && !cookieSameSite.isBlank()){
            builder.sameSite(cookieSameSite);
        }

        if(cookieDomain != null && !cookieDomain.isBlank()){
            builder.domain(cookieDomain);
        }

        exchange.getResponse().addCookie(builder.build());
        return Mono.empty();
    }

}
