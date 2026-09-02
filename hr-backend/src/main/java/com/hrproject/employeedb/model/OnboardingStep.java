package com.hrproject.employeedb.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonIgnore
    private OnboardingWorkflow workflow;

    private String title;

    @Enumerated(EnumType.STRING)
    private StepType type;

    @Enumerated(EnumType.STRING)
    private StepStatus status = StepStatus.PENDING;

    private LocalDate dueDate;

    public enum StepType {
        CONTRACT, DOCUMENT, COMPLIANCE, TRAINING
    }

    public enum StepStatus {
        PENDING, COMPLETED, SKIPPED
    }
}
