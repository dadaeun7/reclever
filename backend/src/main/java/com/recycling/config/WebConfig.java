package com.recycling.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.result.method.annotation.ArgumentResolverConfigurer;

import com.recycling.config.resolver.LoginUserArgumentResolver;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebFluxConfigurer{
    
    private final LoginUserArgumentResolver loginUserArgumentResolver;

    @Override
    public void configureArgumentResolvers(ArgumentResolverConfigurer configurer){
        configurer.addCustomResolver(loginUserArgumentResolver);
    }

}
