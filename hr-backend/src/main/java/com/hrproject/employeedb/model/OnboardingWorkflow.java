package com.hrproject.employeedb.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingWorkflow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private String country;

    @Enumerated(EnumType.STRING)
    private WorkflowStatus status = WorkflowStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL)
    private List<OnboardingStep> steps;

    public enum WorkflowStatus {
        IN_PROGRESS, COMPLETED, CANCELLED
    }
}
