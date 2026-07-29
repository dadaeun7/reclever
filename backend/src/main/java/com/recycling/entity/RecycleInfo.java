package com.recycling.entity;

import java.time.ZonedDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Getter;

@Getter
@Table("recycle_info")
public class RecycleInfo {
    
    @Id
    private Long id;

    @Column("product_name")
    private String productName;

    @Column("materilas")
    private String materilas;

    @Column("description")
    private String description;

    @Column("order_date")
    private ZonedDateTime orderdate;

    @Column("user_id")
    private Long userId;

    @Column("direct_input")
    private Boolean directInput;

    @Builder
    public RecycleInfo(String productName,
        String materilas,
        String description,
        ZonedDateTime orderdate,
        Long userId,
        Boolean directInput
    ){
        this.productName = productName;
        this.materilas = materilas;
        this.description = description;
        this.orderdate = orderdate;
        this.userId = userId;
        this.directInput = directInput;
    }
}
