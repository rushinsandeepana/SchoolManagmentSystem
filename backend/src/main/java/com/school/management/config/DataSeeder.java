package com.school.management.config;

import com.school.management.model.entity.PeriodTimeSlot;
import com.school.management.model.entity.User;
import com.school.management.model.enums.Role;
import com.school.management.repository.PeriodTimeSlotRepository;
import com.school.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PeriodTimeSlotRepository periodTimeSlotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedPeriodTimeSlots();

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
            userRepository.save(User.builder()
                    .username("teacher1")
                    .password(passwordEncoder.encode("teach123"))
                    .fullName("Nimal Perera")
                    .email("nimal@school.local")
                    .performanceScore(85.0)
                    .role(Role.TEACHER)
                    .active(true)
                    .build());
        }

        if (userRepository.findByUsername("teacher2").isEmpty()) {
            userRepository.save(User.builder()
                    .username("teacher2")
                    .password(passwordEncoder.encode("teach123"))
                    .fullName("Kamala Silva")
                    .email("kamala@school.local")
                    .performanceScore(72.0)
                    .role(Role.TEACHER)
                    .active(true)
                    .build());
        }
    }

    private void seedPeriodTimeSlots() {
        List<PeriodTimeSlot> timeSlots = List.of(
                periodTimeSlot(1, "07:30", "08:30"),
                periodTimeSlot(2, "08:30", "09:10"),
                periodTimeSlot(3, "09:10", "09:50"),
                periodTimeSlot(4, "09:50", "10:30"),
                periodTimeSlot(5, "10:50", "11:30"),
                periodTimeSlot(6, "11:30", "12:10"),
                periodTimeSlot(7, "12:10", "12:50"),
                periodTimeSlot(8, "12:50", "13:30")
        );

        periodTimeSlotRepository.saveAll(timeSlots);
    }

    private PeriodTimeSlot periodTimeSlot(int periodNumber, String startTime, String endTime) {
        return PeriodTimeSlot.builder()
                .periodNumber(periodNumber)
                .startTime(LocalTime.parse(startTime))
                .endTime(LocalTime.parse(endTime))
                .build();
    }
}
