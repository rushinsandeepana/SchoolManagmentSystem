package com.school.management.config;

import com.school.management.model.entity.PeriodSlot;
import com.school.management.model.entity.User;
import com.school.management.model.enums.DayOfWeek;
import com.school.management.model.enums.PeriodType;
import com.school.management.model.enums.Role;
import com.school.management.repository.PeriodSlotRepository;
import com.school.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PeriodSlotRepository periodSlotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Admin")
                    .email("admin@school.local")
                    .role(Role.ADMIN)
                    .active(true)
                    .build());
        }

        if (userRepository.findByUsername("teacher1").isEmpty()) {
            User teacher = userRepository.save(User.builder()
                    .username("teacher1")
                    .password(passwordEncoder.encode("teach123"))
                    .fullName("Nimal Perera")
                    .email("nimal@school.local")
                    .subject("Mathematics")
                    .performanceScore(85.0)
                    .role(Role.TEACHER)
                    .active(true)
                    .build());

            seedWeek(teacher);
        }

        if (userRepository.findByUsername("teacher2").isEmpty()) {
            userRepository.save(User.builder()
                    .username("teacher2")
                    .password(passwordEncoder.encode("teach123"))
                    .fullName("Kamala Silva")
                    .email("kamala@school.local")
                    .subject("Science")
                    .performanceScore(72.0)
                    .role(Role.TEACHER)
                    .active(true)
                    .build());
        }
    }

    private void seedWeek(User teacher) {
        for (DayOfWeek day : DayOfWeek.values()) {
            for (int p = 1; p <= 8; p++) {
                PeriodType type;
                String subject = null;
                String className = null;
                if (p <= 4) {
                    type = PeriodType.MANDATORY;
                    subject = "Mathematics";
                    className = "Grade " + (6 + (p % 3));
                } else if (p == 5 || p == 6) {
                    type = PeriodType.RELIEF;
                    subject = "Relief";
                    className = "Grade 8";
                } else {
                    type = PeriodType.FREE;
                }
                periodSlotRepository.save(PeriodSlot.builder()
                        .teacher(teacher)
                        .dayOfWeek(day)
                        .periodNumber(p)
                        .periodType(type)
                        .subject(subject)
                        .className(className)
                        .title(type == PeriodType.FREE ? "Free Period" : subject + " - P" + p)
                        .build());
            }
        }
    }
}
