package com.school.management.controller;

import com.school.management.dto.response.PeriodSlotResponse;
import com.school.management.dto.response.PageResponse;
import com.school.management.model.enums.PeriodType;
import com.school.management.service.PeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/admin/periods")
@RequiredArgsConstructor
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
}
