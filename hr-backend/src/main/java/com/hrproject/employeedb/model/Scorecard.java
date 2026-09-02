package com.hrproject.employeedb.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Scorecard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer technicalRating;
    private Integer culturalRating;
    private Integer communicationRating;
    
    @Column(columnDefinition = "TEXT")
    private String technicalNotes;
    
    @Column(columnDefinition = "TEXT")
    private String culturalNotes;

    private Double overallScore;
}
