package com.school.management.dto.response;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Data
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return PageResponse.<T>builder()
                .content(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int safeSize = size <= 0 ? Math.max(content.size(), 1) : size;
        int totalPages = (int) Math.ceil(totalElements / (double) safeSize);
        return PageResponse.<T>builder()
                .content(content)
                .page(page)
                .size(safeSize)
                .totalElements(totalElements)
                .totalPages(Math.max(totalPages, 1))
                .build();
    }
}
