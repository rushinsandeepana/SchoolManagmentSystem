package com.school.management.repository;

import com.school.management.model.entity.User;
import com.school.management.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByRoleOrderByFullNameAsc(Role role);

    @Query("""
            SELECT u FROM User u
            WHERE u.role = :role
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(u.subject, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<User> searchByRole(@Param("role") Role role, @Param("search") String search, Pageable pageable);
}
