package com.hrproject.employeedb.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback360 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Employee subject; // Employee being evaluated

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private Employee provider; // Employee giving feedback

    private String relationship; // e.g., Peer, Manager, Direct Report, Self
    
    private Integer rating; // 1-5
    
    @Column(length = 1000)
    private String comments;
    
    private LocalDate dateProvided;
}
