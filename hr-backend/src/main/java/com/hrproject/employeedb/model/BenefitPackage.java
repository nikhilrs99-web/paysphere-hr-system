package com.hrproject.employeedb.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BenefitPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type; // HEALTHCARE, RETIREMENT, ALLOWANCE, etc.
    private String description;
    private String provider;
    private Double monthlyCost;
    private Double employerContribution; // Percentage or amount
    private String region;
    private String contractType; // FULL_TIME, PART_TIME, CONTRACTOR
}
