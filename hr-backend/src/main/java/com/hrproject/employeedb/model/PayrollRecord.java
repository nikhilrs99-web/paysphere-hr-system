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
public class PayrollRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    
    private Double grossSalary;
    private Double taxAmount;
    private Double benefitsAmount;
    private Double netSalary;
    
    private String currency;
    private String status; // PENDING, PAID, VOID
    private String paymentReference;
}
