package com.school.management.repository;

import com.school.management.model.entity.User;
import com.school.management.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByRoleOrderByFullNameAsc(Role role);
}
