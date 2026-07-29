package com.recycling.repository;

import java.time.LocalDateTime;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.recycling.dto.RecycleInfoResponse;
import com.recycling.entity.RecycleInfo;

import reactor.core.publisher.Flux;

@Repository()
public interface RecycleInfoRepository extends ReactiveCrudRepository<RecycleInfo, Long>{

    @Query("SELECT ri.product_name, ri.materilas, ri.description, " +
    "ri.order_date, ri.direct_input FROM recycle_info ri WHERE ri.user_id =:userId "+
    " AND ri.order_date BETWEEN :start AND :end")
    public Flux<RecycleInfoResponse> getLists(Long userId, LocalDateTime start, LocalDateTime end);
}
