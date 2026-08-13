package com.recycling.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import com.recycling.constants.JobStatus;

import lombok.Builder;

@Table("job_history")
public class JobHistory {
 
    @Column("user_id")
    private Long userId;

    @Column("status")
    private String status;
    
    @Column("time_stamp")
    private LocalDateTime timeStamp;

    @Column("error_message")
    private String errorMessage;

    @Builder
    public void setJobHistory(
        Long userId,
        String status
    ){
        this.userId = userId;
        this.status = status;
        this.timeStamp = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        this.errorMessage = "";
    }

    @Builder
    public void setErrorJob(
        Long userId,
        String errorMessage
    ){
        this.userId = userId;
        this.status = JobStatus.FAILED.toString();
        this.timeStamp = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        this.errorMessage = errorMessage;
    }
}
