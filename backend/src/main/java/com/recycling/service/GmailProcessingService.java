package com.recycling.service;

import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.stereotype.Service;

import com.recycling.entity.JobHistory;
import com.recycling.entity.ProcessedEmail;
import com.recycling.entity.RecycleInfo;
import com.recycling.infra.gmail.GmailLoadAdapter;
import com.recycling.repository.JobHistoryRepository;
import com.recycling.repository.ProcessedEmailRepository;
import com.recycling.repository.UsersRepository;
import com.recycling.utils.MailParseToSubject;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailProcessingService {
    
    private final GmailLoadAdapter gmailLoadAdapter;
    private final MailParseToSubject mailParseToSubject;
    private final ProcessedEmailRepository processedEmailRepository;
    private final UsersRepository usersRepository;
    private final JobHistoryRepository jobHistoryRepository;
    private final PythonService pythonService;
    private final RecycleInfoService recycleInfoService;


    public Mono<Void> startGetRecycleInfo(String email){
        return usersRepository.findUserIdByEmail(email)
        .flatMap(id -> {
            LocalDate end = LocalDate.now(ZoneId.of("Asia/Seoul"));
            LocalDate start = end.minusWeeks(2);

            return saveJobHistory(id, "STARTED")
                .then(processMails(id, email, start, end).collectList())
                .flatMap(list -> saveJobHistory(id, "COMPLETED"))
                .onErrorResume(e -> saveErrorHistory(id, e.getMessage()));
        }).subscribeOn(Schedulers.boundedElastic())
        .then();
    }

    private Flux<RecycleInfo> processMails(Long userId, String email, LocalDate start, LocalDate end){

        return gmailLoadAdapter.loadMails(email, start, end)
        .flatMap(message -> processedEmailRepository.existsByMailId(message.getId())
                .filter(exists -> !exists)
                .map(exists -> message)
        )
        .flatMap(message -> mailParseToSubject.parseMailToOrder(message))
        .flatMap(dto -> {
            String productName = dto.productName();
            if (productName == null || productName.isBlank()) {
                return Mono.empty();
            }
            return pythonService.submitPythonAnalyst(productName)
                    .flatMap(repo -> recycleInfoService.saveUserInfo(productName, dto.orderTime(), repo.materials(), repo.description(), userId, false))
                    .flatMap(savedRecycleInfo -> {
                        ProcessedEmail newEmail = new ProcessedEmail();
                        newEmail.setMailId(dto.mailId());
                        newEmail.setUserId(userId);
                        return processedEmailRepository.save(newEmail)
                                .thenReturn(savedRecycleInfo); // 최종 반환 타입(RecycleInfo) 유지
                    });
        })
        .doOnError(e -> log.error("[processMails] 처리중 에러 발생", e));
    }



    private Mono<JobHistory> saveJobHistory(Long userId, String status){
        JobHistory history = new JobHistory();
        history.setJobHistory(userId, status);
        return jobHistoryRepository.save(history);
    }

    private Mono<JobHistory> saveErrorHistory(Long userId, String errorMessage){
        JobHistory history = new JobHistory();
        history.setErrorJob(userId, errorMessage);
        return jobHistoryRepository.save(history);
    }
}
