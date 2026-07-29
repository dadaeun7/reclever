package com.recycling.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.web.server.SecurityWebFilterChain;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final ReactiveOAuth2SuccessHandler reactiveOAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityWebFilterChain filterChain(ServerHttpSecurity http,
        ReactiveOAuth2AuthorizedClientService reactiveOAuth2AuthorizedClientService
    ){
        http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/", "/login/**").permitAll()
                .anyExchange().authenticated())
                .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .oauth2Login(oauth2 -> oauth2
                    .authenticationSuccessHandler(reactiveOAuth2SuccessHandler)
            );

        return http.build();
    }
}
