package com.school.management.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateTimetableBatchRequest {

    @NotEmpty(message = "At least one timetable slot is required")
    @Valid
    private List<TimetableRequest> slots;
}