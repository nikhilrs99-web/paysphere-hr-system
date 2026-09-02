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
public class BonusRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private Double amount;
    private String type; // PERFORMANCE, REFERRAL, SIGN_ON, ANNUAL
    private LocalDate allocationDate;
    private String status; // PENDING, PROCESSED (in payroll), CANCELLED
    private String notes;
}
