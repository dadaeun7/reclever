package com.recycling.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebclientConfig {
    
    @Bean
    public WebClient defauClient(){
        return WebClient.builder()
        .build();
    }
}
