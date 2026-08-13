package com.recycling.service;

import org.springframework.stereotype.Service;

import com.recycling.dto.PythonResponeDto;
import com.recycling.grpc.ProductRequest;
import com.recycling.grpc.SubmitPythonAnalystGrpc;

import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class PythonGrpcService {
    
    @GrpcClient("python-service")
    private SubmitPythonAnalystGrpc.SubmitPythonAnalystBlockingStub pythonGrpcSub;

    public Mono<PythonResponeDto> submitPythonAnalyst(String productName){
        return Mono.fromCallable(()->{
            ProductRequest request = ProductRequest.newBuilder()
                .setProductName(productName)
                .build();

            return pythonGrpcSub.classifyProduct(request);
        }).map(grpcResponse->{
            return new PythonResponeDto(
                grpcResponse.getMaterialList(),
                grpcResponse.getDescription()
            );
        })
        .doOnError(e -> log.error("[submitPythonAnalyst] gRPC 처리 중 에러 발생: {}", e.getMessage()));
    }

}
