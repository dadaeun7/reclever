package com.recycling;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class RecyclingMainServiceApplication {
    
    public static void main(String[] args){
        SpringApplication.run(RecyclingMainServiceApplication.class, args);
    }
}
