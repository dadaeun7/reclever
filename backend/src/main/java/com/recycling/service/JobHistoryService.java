package com.recycling.service;

import org.springframework.stereotype.Service;

import com.recycling.dto.JobHistoryResponse;
import com.recycling.repository.JobHistoryRepository;
import com.recycling.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class JobHistoryService {
    
    private final JobHistoryRepository jobHistoryRepository;
    private final UsersRepository usersRepository;

    public Flux<JobHistoryResponse> getLists(String email){
        return usersRepository.findUserIdByEmail(email)
        .flatMapMany(id -> jobHistoryRepository.getLists(id))
        .map(entity -> new JobHistoryResponse(
            entity.status(),
            entity.timeStamp()
        ));
    }
}
