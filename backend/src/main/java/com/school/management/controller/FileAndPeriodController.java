package com.school.management.controller;

import com.school.management.dto.request.PeriodContentRequest;
import com.school.management.dto.response.ApiMessage;
import com.school.management.dto.response.MediaFileResponse;
import com.school.management.dto.response.PeriodContentResponse;
import com.school.management.dto.response.PeriodDetailResponse;
import com.school.management.model.entity.MediaFile;
import com.school.management.security.UserPrincipal;
import com.school.management.service.FileStorageService;
import com.school.management.service.PeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FileAndPeriodController {

    private final FileStorageService fileStorageService;
    private final PeriodService periodService;

    @GetMapping("/periods/{id}")
    public PeriodDetailResponse periodDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return periodService.getPeriodDetail(id, principal);
    }

    @PostMapping("/periods/{id}/content")
    public PeriodContentResponse createContent(
            @PathVariable Long id,
            @RequestBody PeriodContentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        return periodService.createContent(
                id,
                request,
                principal
        );
}

    @PostMapping("/periods/{periodId}/content/{contentId}/files")
    public MediaFileResponse upload(
            @PathVariable Long periodId,
            @PathVariable Long contentId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {

        return fileStorageService.store(
                periodId,
                contentId,
                file,
                principal
        );
    }

    @GetMapping("/files/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        MediaFile meta = fileStorageService.getMeta(id);
        Resource resource = fileStorageService.loadAsResource(id, principal);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(meta.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + meta.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/files/{id}")
    public ApiMessage deleteFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        fileStorageService.delete(id, principal);
        return new ApiMessage("File deleted");
    }

    @DeleteMapping("/periods/{periodId}/content/{contentId}")
    public void deleteContent(
            @PathVariable Long periodId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal UserPrincipal principal) {

        periodService.deleteContent(
                periodId,
                contentId,
                principal
        );
    }
}
