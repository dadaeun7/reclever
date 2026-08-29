package com.recycling.service;

import org.springframework.stereotype.Service;

import com.recycling.dto.PythonResponeDto;
import com.recycling.grpc.ProductRequest;
import com.recycling.grpc.SubmitPythonAnalystGrpc;

import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
public class PythonGrpcService {
    
    @GrpcClient("python")
    private SubmitPythonAnalystGrpc.SubmitPythonAnalystBlockingStub pythonGrpcSub;

    public Mono<PythonResponeDto> submitPythonAnalyst(String productName){
        return Mono.fromCallable(()->{
            ProductRequest request = ProductRequest.newBuilder()
                .setProductName(productName)
                .build();

            return pythonGrpcSub.classifyProduct(request);
        })
        .subscribeOn(Schedulers.boundedElastic())
        .map(grpcResponse->{
            return new PythonResponeDto(
                grpcResponse.getMaterialList(),
                grpcResponse.getDescription()
            );
        })
        .doOnError(e -> log.error("[submitPythonAnalyst] gRPC 처리 중 에러 발생: {}", e.getMessage()));
    }

    public Flux<PythonResponeDto> recommandPythonAnalyst(String productName){
        return Mono.fromCallable(()->{
            ProductRequest request = ProductRequest.newBuilder()
                .setProductName(productName)
                .build();
                return pythonGrpcSub.listProducts(request);
        })
        .subscribeOn(Schedulers.boundedElastic())
        .flatMapMany(grpcResponse->
            Flux.fromIterable(grpcResponse.getProductsList())
                .map(product-> new PythonResponeDto(product.getMaterialList(), product.getDescription()))
        );
    }

}
