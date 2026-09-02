package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.Employee;
import com.hrproject.employeedb.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*") // For development
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/search")
    public Page<Employee> searchEmployees(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return employeeService.searchEmployees(query, department, status, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        return employeeService.getEmployeeById(id)
                .map(employee -> {
                    employee.setFirstName(employeeDetails.getFirstName());
                    employee.setLastName(employeeDetails.getLastName());
                    employee.setEmail(employeeDetails.getEmail());
                    employee.setJobTitle(employeeDetails.getJobTitle());
                    employee.setDepartment(employeeDetails.getDepartment());
                    employee.setLocation(employeeDetails.getLocation());
                    employee.setBaseSalary(employeeDetails.getBaseSalary());
                    employee.setCurrency(employeeDetails.getCurrency());
                    employee.setCountry(employeeDetails.getCountry());
                    employee.setTaxId(employeeDetails.getTaxId());
                    employee.setBankDetails(employeeDetails.getBankDetails());
                    employee.setPhone(employeeDetails.getPhone());
                    employee.setStatus(employeeDetails.getStatus());
                    employee.setJoiningDate(employeeDetails.getJoiningDate());
                    return ResponseEntity.ok(employeeService.saveEmployee(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Employee> updateEmployeeStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        return employeeService.getEmployeeById(id)
                .map(employee -> {
                    employee.setStatus(newStatus);
                    return ResponseEntity.ok(employeeService.saveEmployee(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        // Hard delete implementation remains available if specifically requested, 
        // but UI will primarily use the Status Toggle (PATCH) for soft delete.
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
