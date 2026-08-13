package com.recycling.security;

import java.util.Collections;

import org.springframework.http.HttpCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import com.recycling.config.JwtConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtConfig jwtConfig;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        
        String token = getCookie(exchange, "reclever_access_token");

        if(token != null){
            try{
                String email = jwtConfig.extractEmail(token);
                Authentication auth = new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
                return chain.filter(exchange).contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth));
                
            }catch(Exception e){
                log.error("JwtAuthenticationFilter Error: {}", e.getMessage());
            }
        }
        return chain.filter(exchange);

    }
    
    private String getCookie(ServerWebExchange exchange, String name){
        HttpCookie cookie = exchange.getRequest().getCookies().getFirst(name);
        return (cookie != null) ? cookie.getValue() : null;
    }
}
