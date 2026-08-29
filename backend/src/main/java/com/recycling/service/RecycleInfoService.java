package com.recycling.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.recycling.dto.RecycleInfoResponse;
import com.recycling.entity.RecycleInfo;
import com.recycling.repository.RecycleInfoRepository;
import com.recycling.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecycleInfoService {
    
    private final RecycleInfoRepository recycleInfoRepository;
    private final UsersRepository usersRepository;
    private final PythonGrpcService pythonGrpcService;

    public Flux<RecycleInfoResponse> getRecycleInfo(String email, LocalDateTime start, LocalDateTime end){
        return usersRepository.findUserIdByEmail(email)
        .flatMapMany(id -> recycleInfoRepository.getLists(id, start, end));
    }

    public Mono<RecycleInfoResponse> getOneRecycleInfo(String email, String productName) {
        return usersRepository.findUserIdByEmail(email)
                .flatMap(userId -> pythonGrpcService.submitPythonAnalyst(productName)
                    .flatMap(res -> saveUserInfo(productName, null, res.materials(), res.description(), userId, true))
                    .map(info -> RecycleInfoResponse.builder()
                            .productName(productName)
                            .materilas(info.getMaterilas() != null ? List.of(info.getMaterilas().split(",")) : Collections.emptyList())
                            .description(info.getDescription())
                            .orderDate(info.getOrderdate().toLocalDateTime())
                            .directInput(info.getDirectInput())
                            .build()));
    }

    public Flux<RecycleInfoResponse> getRecommandRecycleInfo(String email, String productName){
        return usersRepository.findUserIdByEmail(email)
            .flatMapMany(userId -> pythonGrpcService.recommandPythonAnalyst(productName))
                .map(res-> RecycleInfoResponse.builder()
                    .productName(productName)
                    .materilas(res.materials() != null ? res.materials():Collections.emptyList())
                    .description(res.description())
                    .orderDate(ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                    .directInput(true)
                    .build());
    }

    public Mono<RecycleInfo> saveUserInfo(String productName, ZonedDateTime orderTime,
        List<String> materials, String description, Long userId, Boolean directInput){
        
        String materialsCsv = "";
        if (materials != null && !materials.isEmpty()) {
            materialsCsv = String.join(",", materials);
        }

        // orderTime이 null이면 현재 시간(ZonedDateTime.now()) 사용
        ZonedDateTime effectiveOrderTime = (orderTime != null) ? orderTime : ZonedDateTime.now(ZoneId.of("Asia/Seoul"));
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

    public Mono<ResponseEntity<Void>> updateRecycleInfo(Long recycleId, List<String> material, String description){
        
        String strMaterial = (material != null) ? String.join(",",material) : "";
        
        return recycleInfoRepository.updateRecycle(recycleId, strMaterial, description)
            .then(Mono.just(ResponseEntity.ok().<Void>build()))
            .onErrorResume(ex -> 
                Mono.error(new ResponseStatusException(
                    HttpStatusCode.valueOf(500),
                    "재활용 정보 수정 중 오류가 발생했습니다.",
                    ex
                ))
            );
    }
}
