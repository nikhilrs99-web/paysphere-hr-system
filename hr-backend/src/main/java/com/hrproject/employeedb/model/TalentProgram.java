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
public class TalentProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String targetRegion;
    private String targetRole;
    
    @ElementCollection
    private List<String> objectives;
    
    private Integer durationWeeks;
    
    @ManyToMany
    @JoinTable(
        name = "program_enrollees",
        joinColumns = @JoinColumn(name = "program_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private List<Employee> enrollees;
}
