package com.school.management.service;

import com.school.management.dto.response.MediaFileResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.mapper.EntityMapper;
import com.school.management.model.entity.MediaFile;
import com.school.management.model.entity.PeriodSlot;
import com.school.management.repository.MediaFileRepository;
import com.school.management.security.UserPrincipal;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final MediaFileRepository mediaFileRepository;
    private final PeriodService periodService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private Path root;

    @PostConstruct
    public void init() throws IOException {
        root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    @Transactional
    public MediaFileResponse store(Long periodId, MultipartFile file, UserPrincipal currentUser) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        PeriodSlot slot = periodService.requireSlot(periodId);
        periodService.assertCanAccess(slot, currentUser);

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String stored = UUID.randomUUID() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");

        try {
            Path target = root.resolve(stored);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }

        MediaFile media = MediaFile.builder()
                .periodSlot(slot)
                .uploadedBy(currentUser.getUser())
                .originalFileName(original)
                .storedFileName(stored)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .fileSize(file.getSize())
                .fileCategory(categorize(original, file.getContentType()))
                .build();

        return EntityMapper.toMediaFileResponse(mediaFileRepository.save(media));
    }

    public Resource loadAsResource(Long fileId, UserPrincipal currentUser) {
        MediaFile media = mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        periodService.assertCanAccess(media.getPeriodSlot(), currentUser);
        try {
            Path file = root.resolve(media.getStoredFileName());
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not readable");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found");
        }
    }

    public MediaFile getMeta(Long fileId) {
        return mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
    }

    @Transactional
    public void delete(Long fileId, UserPrincipal currentUser) {
        MediaFile media = mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        periodService.assertCanAccess(media.getPeriodSlot(), currentUser);
        try {
            Files.deleteIfExists(root.resolve(media.getStoredFileName()));
        } catch (IOException ignored) {
        }
        mediaFileRepository.delete(media);
    }

    private String categorize(String filename, String contentType) {
        String lower = filename.toLowerCase(Locale.ROOT);
        String type = contentType != null ? contentType.toLowerCase(Locale.ROOT) : "";
        if (type.startsWith("image/") || lower.matches(".*\\.(png|jpg|jpeg|gif|webp|bmp)$")) {
            return "IMAGE";
        }
        if (type.startsWith("video/") || lower.matches(".*\\.(mp4|webm|mov|avi|mkv)$")) {
            return "VIDEO";
        }
        if (type.contains("pdf") || lower.endsWith(".pdf")) {
            return "PDF";
        }
        return "OTHER";
    }
}
