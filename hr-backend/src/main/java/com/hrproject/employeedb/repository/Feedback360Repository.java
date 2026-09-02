package com.hrproject.employeedb.repository;

import com.hrproject.employeedb.model.Feedback360;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface Feedback360Repository extends JpaRepository<Feedback360, Long> {
    List<Feedback360> findBySubjectId(Long subjectId);
}
