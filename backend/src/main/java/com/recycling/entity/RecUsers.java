package com.recycling.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Getter;

@Getter
@Table("rec_users")
public class RecUsers {
    
    @Id
    private Long id;

    @Column("name")
    private String name;

    @Column("email")
    private String email;

    @Column("access_token")
    private String accessToken;

    @Column("refresh_token")
    private String refreshToken;

    @Column("active")
    private Boolean active;

    @Column("join_at")
    private LocalDateTime joinAt;

    @Column("modify_at")
    private LocalDateTime modifyAt;

    @Builder
    public RecUsers(String name,
        String email,
        String accessToken,
        String refreshToken
    ){
        this.name = name;
        this.email = email;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.active = true;
        this.joinAt = LocalDateTime.now();
        this.modifyAt = LocalDateTime.now();
    }

    public void setAccessToken(String accessToken){
        this.accessToken = accessToken;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setRefreshToken(String refreshToken){
        this.refreshToken = refreshToken;
    }
}
