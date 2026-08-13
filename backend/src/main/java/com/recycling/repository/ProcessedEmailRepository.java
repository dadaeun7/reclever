package com.recycling.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.recycling.entity.ProcessedEmail;

import reactor.core.publisher.Mono;

@Repository()
public interface ProcessedEmailRepository extends ReactiveCrudRepository<ProcessedEmail, Long> {
    
    @Query("SELECT * FROM processed_email pe WHERE pe.mail_id = :emailId")
    Mono<ProcessedEmail> findByMailId(String emailId);

    @Query("SELECT EXISTS(SELECT 1 FROM processed_email pe WHERE pe.mail_id = :emailId)")
    Mono<Boolean> existsByMailId(String emailId);
}
