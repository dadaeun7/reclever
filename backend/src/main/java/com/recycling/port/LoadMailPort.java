package com.recycling.port;

import java.time.LocalDate;

import com.recycling.entity.ProcessedEmail;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


public interface LoadMailPort {

    Flux<?> loadMails(String email, LocalDate start, LocalDate end);

    Mono<ProcessedEmail> findEmailById(String messageId);
}
