package com.school.management.controller;

import com.school.management.dto.response.PageResponse;
import com.school.management.dto.response.PeriodSlotResponse;
import com.school.management.dto.response.UserResponse;
import com.school.management.model.enums.PeriodType;
import com.school.management.service.PeriodService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/periods")
@RequiredArgsConstructor
@Validated
@Slf4j
public class AssignPeriodController {

	private final PeriodService periodService;

	@GetMapping
	public PageResponse<PeriodSlotResponse> getAllAssignments(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) PeriodType periodType) {
		return periodService.listAssignments(page, size, search, periodType);
	}

	@GetMapping("/available-teachers")
	public List<UserResponse> getAvailableTeachers(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
			@RequestParam @Min(1) @Max(8) Integer periodNumber,
			@RequestParam(required = false) Long teacherId) {
		return periodService.getAvailableTeachers(date, periodNumber, teacherId);
	}
}
