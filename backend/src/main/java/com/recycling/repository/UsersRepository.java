package com.recycling.repository;

import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.recycling.dto.GoogleTokenDto;
import com.recycling.entity.RecUsers;

import reactor.core.publisher.Mono;

@Repository()
public interface UsersRepository extends ReactiveCrudRepository<RecUsers, Long> {
    
    @Query("SELECT u.access_token AS accessToken, u.refresh_token AS refreshToken "+
        "FROM rec_users u WHERE u.email=:email")
    Mono<GoogleTokenDto> getTokenByEmail(String email);

    @Query("SELECT u.id FROM rec_users u WHERE u.email = :email")
    Mono<Long> findUserIdByEmail(String email);

    @Query("SELECT u.refresh_token FROM rec_users u WHERE u.email = :email")
    Mono<String> findRefreshTokenByEmail(String email);

    @Query("SELECT EXISTS(SELECT * FROM rec_users ru WHERE ru.email =:email")
    Mono<Boolean> existsByEmail(String email);

    @Query("SELECT * FROM rec_users ru WHERE ru.email =:email")
    Mono<RecUsers> findUserByEmail(String email);

    @Modifying
    @Query("DELETE FROM rec_users ru WHERE ru.email =:email")
    Mono<Void> deleteByEmail(String email);
}
