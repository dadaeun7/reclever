package com.recycling.security;

import com.recycling.config.JwtConfig;
import com.recycling.dto.GoogleTokenDto;
import com.recycling.entity.RecUsers;
import com.recycling.repository.UsersRepository;
import com.recycling.utils.AesUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReactiveOAuth2SuccessHandler implements ServerAuthenticationSuccessHandler {

    private final UsersRepository userRepository;
    private final ServerOAuth2AuthorizedClientRepository oAuthorizedClientRepository;
    private final JwtConfig jwtConfig;
    private final AesUtil aesUtil;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site}")
    private String cookieSameSite;

    @Value("${app.cookie.domain:}")
    private String cookieDomain;

    @Value("${app.front.url}")
    private String frontUrl;

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        ServerWebExchange exchange = webFilterExchange.getExchange();
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Mono<GoogleTokenDto> tokenResolutionMono = Mono.just(new GoogleTokenDto("", null));

        if(authentication instanceof OAuth2AuthenticationToken oauthToken){

            String clientRegistrationId = oauthToken.getAuthorizedClientRegistrationId();

            tokenResolutionMono = oAuthorizedClientRepository
                .loadAuthorizedClient(clientRegistrationId, authentication, exchange)
                .map(athClient -> {
                    String accessToken = athClient.getAccessToken().getTokenValue();
                    String refreshToken = (athClient.getRefreshToken() != null) ? 
                        athClient.getRefreshToken().getTokenValue()
                        : null;

                    log.error("[onAuthenticationSuccess] accessToken:{}, refreshToken:{}", accessToken, refreshToken);

                    return new GoogleTokenDto(accessToken,refreshToken);
                })
                .defaultIfEmpty(new GoogleTokenDto("", null));
        }

        return tokenResolutionMono.flatMap(tokens -> {
            return userRepository.findUserByEmail(email)
                    .flatMap(existingUser -> {
                        existingUser.setAccessToken(aesUtil.encrypt(tokens.accessToken()));
                        existingUser.setName(name);
                        if (tokens.refreshToken() != null) {
                            existingUser.setRefreshToken(aesUtil.encrypt(tokens.refreshToken()));
                        }
                        return userRepository.save(existingUser);
                    })
                    .switchIfEmpty(
                            Mono.defer(() -> {
                                RecUsers newUser = RecUsers.builder()
                                        .email(email)
                                        .name(name)
                                        .accessToken(aesUtil.encrypt(tokens.accessToken()))
                                        .refreshToken(aesUtil.encrypt(tokens.refreshToken()))
                                        .build();
                                return userRepository.save(newUser);
                            })
                    );
        })
        .flatMap(savedUser -> {
            // 3. 최종 리다이렉트 처리
            String ourJwtToken = jwtConfig.createToken(email, name);
            ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("reclever_access_token", ourJwtToken)
            .path("/")
            .httpOnly(true)
            .secure(cookieSecure)
            .maxAge(Duration.ofDays(7));

            if(cookieSameSite != null && !cookieSameSite.isBlank()){
                builder.sameSite(cookieSameSite);
            }

            if(cookieDomain != null && !cookieDomain.isBlank()){
                builder.domain(cookieDomain);
            }

            exchange.getResponse().addCookie(builder.build());

            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.FOUND);
            exchange.getResponse().getHeaders().setLocation(URI.create(frontUrl));
            return exchange.getResponse().setComplete();
        });
    }
}