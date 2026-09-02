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
public class PerformanceReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    private String period; // e.g., "Q1 2026", "Annual 2025"
    
    private Integer rating; // 1-5
    
    @Column(length = 2000)
    private String feedback;
    
    private LocalDate reviewDate;
    
    @Enumerated(EnumType.STRING)
    private ReviewStatus status = ReviewStatus.SUBMITTED;

    public enum ReviewStatus {
        DRAFT, SUBMITTED, FINALIZED
    }
}
