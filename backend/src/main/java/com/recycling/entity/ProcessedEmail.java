package com.recycling.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table("processed_email")
public class ProcessedEmail {
    @Id
    private Long id;

    @Column("mail_id")
    private String mailId;

    @Column("user_id")
    private Long userId;
}
