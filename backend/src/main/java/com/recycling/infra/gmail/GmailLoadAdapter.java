package com.recycling.infra.gmail;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.ClientParametersAuthentication;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.recycling.entity.ProcessedEmail;
import com.recycling.port.LoadMailPort;
import com.recycling.repository.ProcessedEmailRepository;
import com.recycling.repository.UsersRepository;
import com.recycling.utils.AesUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
@RequiredArgsConstructor
@Slf4j
public class GmailLoadAdapter implements LoadMailPort{

    private final ProcessedEmailRepository processedEmailRepository;
    private final HttpTransport httpTransport;
    private final JsonFactory jsonFactory;
    private final UsersRepository usersRepository;
    private final AesUtil aesUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;
    
    @Override
    public Mono<ProcessedEmail> findEmailById(String messageId) {
        return processedEmailRepository.findByMailId(messageId);
    }

    @Override
    public Flux<Message> loadMails(String email, LocalDate start, LocalDate end) {

        String queryForSetQ = String.format(
        "in:anywhere {from:@noreply@e.coupang.com from:@noreply@woowahan.com from:@help@kurly.com} subject:(주문) after:%s before:%s",
        start, end);

        return getGmailClientUser(email)
            .flatMapMany(gmail -> getMessageResponse(gmail, queryForSetQ)
                .flatMapMany(response -> {
                    List<Message> messages = response.getMessages();
                    if (messages == null || messages.isEmpty()) return Flux.empty();
                    
                    return Flux.fromIterable(messages)
                            .flatMap(msg -> Mono.fromCallable(() -> 
                                    gmail.users().messages().get("me", msg.getId()).setFormat("full").execute()
                            ).subscribeOn(Schedulers.boundedElastic())); // 상세 정보 채운 Message 반환
                })
                .doOnError(e->{log.error("[loadMails] response message 처리 중 에러 발생: {}", e);})
            );
    }

    private Mono<ListMessagesResponse> getMessageResponse(Gmail gmail, String queryForSetQ) {
        return Mono.fromCallable(() -> gmail.users()
                .messages()
                .list("me")
                .setQ(queryForSetQ)
                .execute())
                .subscribeOn(Schedulers.boundedElastic())
                .doOnError(e-> {log.error("[getMessageResponse] message 불러오는 중 에러 : {}",e);})
                .onErrorMap(error -> new IllegalArgumentException("[getMessageResponse] Gmail 쿼리를 통해 받은 response가 null 입니다."));
    }

    private Mono<Gmail> getGmailClientUser(String email){

        return usersRepository.findUserByEmail(email)
        .flatMap(tokenEntity -> Mono.fromCallable(() -> {

            String deAccessToken = aesUtil.decrypt(tokenEntity.getAccessToken());
            String deRefreshToken = aesUtil.decrypt(tokenEntity.getRefreshToken());

            Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
                    .setTransport(httpTransport)
                    .setJsonFactory(jsonFactory)
                    .setTokenServerEncodedUrl("https://oauth2.googleapis.com/token")
                    .setClientAuthentication(new ClientParametersAuthentication(clientId, clientSecret))
                    .build()
                    .setAccessToken(deAccessToken)
                    .setRefreshToken(deRefreshToken);

            // [중요] 토큰 갱신 시도
            boolean success = credential.refreshToken();

            if (success || !deAccessToken.equals(credential.getAccessToken())) {
                tokenEntity.setAccessToken(aesUtil.encrypt(credential.getAccessToken()));
                usersRepository.save(tokenEntity).subscribe();
            }

            if (credential.getAccessToken() == null) {
                throw new IllegalStateException("토큰 갱신 후에도 액세스 토큰이 없습니다. DB의 리프레시 토큰을 확인하세요.");
            }

            return new Gmail.Builder(httpTransport, jsonFactory, credential)
                    .setApplicationName("Recycling Service")
                    .build();
        }))
        .subscribeOn(Schedulers.boundedElastic());
    }

}
