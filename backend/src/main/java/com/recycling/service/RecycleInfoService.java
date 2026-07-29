package com.recycling.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.recycling.dto.RecycleInfoResponse;
import com.recycling.entity.RecycleInfo;
import com.recycling.repository.RecycleInfoRepository;
import com.recycling.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RecycleInfoService {
    
    private final RecycleInfoRepository recycleInfoRepository;
    private final UsersRepository usersRepository;
    private final PythonService pythonService;

    public Flux<RecycleInfoResponse> getRecycleInfo(String email, LocalDateTime start, LocalDateTime end){
        return usersRepository.findUserIdByEmail(email)
        .flatMapMany(id -> recycleInfoRepository.getLists(id, start, end));
    }

    public Mono<RecycleInfoResponse> getOneRecycleInfo(String email, String productName) {
        return usersRepository.findUserIdByEmail(email)
                .flatMap(userId -> pythonService.submitPythonAnalyst(productName)
                    .flatMap(res -> saveUserInfo(productName, null, res.materials(), res.description(), userId, true))
                    .map(info -> RecycleInfoResponse.builder()
                            .productName(productName)
                            .materilas(info.getMaterilas() != null ? List.of(info.getMaterilas().split(",")) : Collections.emptyList())
                            .description(info.getDescription())
                            .orderDate(info.getOrderdate().toLocalDateTime())
                            .directInput(info.getDirectInput())
                            .build()));
    }

    public Mono<RecycleInfo> saveUserInfo(String productName, ZonedDateTime orderTime,
        List<String> materials, String description, Long userId, Boolean directInput){
        
        String materialsCsv = "";
        if (materials != null && !materials.isEmpty()) {
            materialsCsv = String.join(",", materials);
        }

        // 2. orderTime이 null이면 현재 시간(ZonedDateTime.now()) 사용
        ZonedDateTime effectiveOrderTime = (orderTime != null) ? orderTime : ZonedDateTime.now(ZoneId.of("Asia/Seoul"));

        // 3. 엔티티 생성 후 저장
        RecycleInfo info = RecycleInfo.builder()
                .productName(productName)
                .materilas(materialsCsv) 
                .description(description)
                .userId(userId)
                .orderdate(effectiveOrderTime)
                .directInput(directInput)
                .build();

        return recycleInfoRepository.save(info);
    }
}
