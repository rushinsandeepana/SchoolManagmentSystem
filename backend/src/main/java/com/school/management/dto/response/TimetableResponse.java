package com.school.management.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
@Builder
@AllArgsConstructor 
public class TimetableResponse {
    
    private Long id;

    private Long teacherId;
    private String teacherName;

    private Long subjectId;
    private String subjectName;

    private Long classId;
    private String className;

    private String day;
    private Integer period;

    private LocalDateTime  createdAt;
}
