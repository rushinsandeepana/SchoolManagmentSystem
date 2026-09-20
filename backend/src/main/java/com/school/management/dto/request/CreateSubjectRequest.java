package com.school.management.dto.request;

import com.school.management.model.enums.SubjectType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSubjectRequest {
	@NotBlank(message = "Subject name is required")
	@Size(max = 120, message = "Subject name must not exceed 120 characters")
	private String subjectName;

	@NotBlank(message = "Subject code is required")
	@Size(max = 30, message = "Subject code must not exceed 30 characters")
	private String subjectCode;

	@NotNull(message = "Subject type is required")
	private SubjectType subjectType;

	@NotNull(message = "Status is required")
	private Boolean active;
}
