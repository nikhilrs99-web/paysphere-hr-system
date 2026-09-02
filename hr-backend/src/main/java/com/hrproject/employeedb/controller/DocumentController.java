package com.hrproject.employeedb.controller;

import com.hrproject.employeedb.model.Document;
import com.hrproject.employeedb.model.Employee;
import com.hrproject.employeedb.service.DocumentService;
import com.hrproject.employeedb.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/upload/{employeeId}")
    public ResponseEntity<Document> uploadDocument(@PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file) throws IOException {
        Employee employee = employeeService.getEmployeeById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return ResponseEntity.ok(documentService.storeDocument(file, employee));
    }

    @GetMapping("/employee/{employeeId}")
    public List<Document> getEmployeeDocuments(@PathVariable Long employeeId) {
        return documentService.getDocumentsByEmployee(employeeId);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        Document document = documentService.getDocument(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .body(document.getData());
    }
}
