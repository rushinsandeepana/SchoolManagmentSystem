package com.school.management.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor

public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Async
    public void sendTeacherWelcomeEmail(
            String email,
            String teacherName,
            String username,
            String temporaryPassword,
            String loginUrl) {

        try {
            Context context = new Context();

            context.setVariable("teacherName", teacherName);
            context.setVariable("username", username);
            context.setVariable("temporaryPassword", temporaryPassword);
            context.setVariable("loginUrl", loginUrl);

            String html = templateEngine.process(
                    "email/welcome",
                    context
            );

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Welcome to School Management System");
            helper.setText(html, true);
            
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException(
                    "Failed to send teacher welcome email",
                    e
            );
        }
    }
}