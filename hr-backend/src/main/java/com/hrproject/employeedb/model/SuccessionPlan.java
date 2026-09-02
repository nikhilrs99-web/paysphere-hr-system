package com.hrproject.employeedb.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuccessionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private PotentialLevel potential = PotentialLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    private Readiness readiness = Readiness.IN_2_YEARS;

    private String targetRole;
    private String developmentNeeds;

    public enum PotentialLevel {
        HIGH, MEDIUM, LOW
    }

    public enum Readiness {
        READY_NOW, IN_1_YEAR, IN_2_YEARS, EMERGENCY_ONLY
    }
}
