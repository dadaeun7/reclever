package com.recycling.config.resolver;

import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.BindingContext;
import org.springframework.web.reactive.result.method.HandlerMethodArgumentResolver;
import org.springframework.web.server.ServerWebExchange;

import com.recycling.config.JwtConfig;
import com.recycling.global.annotaion.LoginUser;
import com.recycling.utils.AesUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoginUserArgumentResolver implements HandlerMethodArgumentResolver{

    private final JwtConfig jwtConfig;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(LoginUser.class)
            && parameter.getParameterType().equals(String.class);
    }

    @Override
    public Mono<Object> resolveArgument(MethodParameter parameter, BindingContext bindingContext,
            ServerWebExchange exchange) {
        
        var cookies = exchange.getRequest().getCookies().get("reclever_access_token");
        if(cookies == null || cookies.isEmpty()){
            return Mono.empty();
        }


        String accessToken = cookies.get(0).getValue();

        try{
            String email = jwtConfig.extractEmail(accessToken);

            if(email == null || email.isBlank()){
                return Mono.empty();
            }

            return Mono.just(email);
        }catch(Exception e){
            log.error("[Login User Resolve Error : {}", e.getMessage());
            return Mono.empty();
        }
    }
    
}
