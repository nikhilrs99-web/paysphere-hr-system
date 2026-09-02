package com.hrproject.employeedb.service;

import com.hrproject.employeedb.model.Document;
import com.hrproject.employeedb.model.Employee;
import com.hrproject.employeedb.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public Document storeDocument(MultipartFile file, Employee employee) throws IOException {
        Document document = new Document();
        document.setFileName(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        document.setData(file.getBytes());
        document.setUploadDate(LocalDateTime.now());
        document.setEmployee(employee);
        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByEmployee(Long employeeId) {
        return documentRepository.findByEmployeeId(employeeId);
    }

    public Document getDocument(Long id) {
        return documentRepository.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
    }
}
