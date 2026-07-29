package com.recycling.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.recycling.dto.JobHistoryResponse;
import com.recycling.entity.JobHistory;

import reactor.core.publisher.Flux;

@Repository()
public interface JobHistoryRepository extends ReactiveCrudRepository<JobHistory, Long>{

    @Query("SELECT jh.status, jh.time_stamp FROM job_history jh WHERE jh.user_id =:userId")
    Flux<JobHistoryResponse> getLists(Long userId);
    
} 
