package com.school.management.service;

import com.school.management.dto.response.DailyTeacherAttendanceResponse;
import com.school.management.dto.response.TeacherAttendanceResponse;
import com.school.management.model.entity.TeacherAttendance;
import com.school.management.model.entity.User;
import com.school.management.model.enums.AttendanceStatus;
import com.school.management.repository.TeacherAttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherAttendanceExcelService {

    private final TeacherAttendanceService attendanceService;
    private final TeacherAttendanceRepository attendanceRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter HEADER_DAY_FMT = DateTimeFormatter.ofPattern("MM/dd\nEEE");

    /**
     * Generates an Excel attendance report for a single date.
     */
    public byte[] generateDailyAttendanceExcel(LocalDate date) throws IOException {
        DailyTeacherAttendanceResponse data = attendanceService.getDailyAttendance(date);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Attendance " + date.format(DATE_FMT));
            sheet.setDisplayGridlines(true);

            // Palette colors
            byte[] navyRgb = new byte[]{(byte) 30, (byte) 58, (byte) 138};       // #1E3A8A
            byte[] blueRgb = new byte[]{(byte) 37, (byte) 99, (byte) 235};       // #2563EB
            byte[] lightGrayRgb = new byte[]{(byte) 243, (byte) 244, (byte) 246}; // #F3F4F6

            // Status background & text colors
            byte[] presentBg = new byte[]{(byte) 220, (byte) 252, (byte) 231};  // #DCFCE7
            byte[] presentFg = new byte[]{(byte) 22, (byte) 101, (byte) 52};    // #166534

            byte[] absentBg = new byte[]{(byte) 254, (byte) 226, (byte) 226};   // #FEE2E2
            byte[] absentFg = new byte[]{(byte) 153, (byte) 27, (byte) 27};     // #991B1B

            byte[] leaveBg = new byte[]{(byte) 254, (byte) 243, (byte) 199};    // #FEF3C7
            byte[] leaveFg = new byte[]{(byte) 146, (byte) 64, (byte) 14};      // #92400E

            byte[] halfDayBg = new byte[]{(byte) 224, (byte) 242, (byte) 254};  // #E0F2FE
            byte[] halfDayFg = new byte[]{(byte) 7, (byte) 89, (byte) 133};     // #075985

            // Styles
            XSSFCellStyle titleStyle = createTitleStyle(workbook, navyRgb, 14, true);
            XSSFCellStyle subtitleStyle = createSubtitleStyle(workbook, blueRgb, 10, false);
            XSSFCellStyle statLabelStyle = createStatLabelStyle(workbook, lightGrayRgb);
            XSSFCellStyle statValueStyle = createStatValueStyle(workbook);
            XSSFCellStyle tableHeaderStyle = createTableHeaderStyle(workbook, navyRgb);
            XSSFCellStyle normalCellStyle = createBorderedStyle(workbook, HorizontalAlignment.LEFT, false);
            XSSFCellStyle centerCellStyle = createBorderedStyle(workbook, HorizontalAlignment.CENTER, false);
            XSSFCellStyle zebraCellStyle = createBorderedStyle(workbook, HorizontalAlignment.LEFT, false);
            zebraCellStyle.setFillForegroundColor(new XSSFColor(lightGrayRgb, null));
            zebraCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Map<AttendanceStatus, XSSFCellStyle> statusStyles = new EnumMap<>(AttendanceStatus.class);
            statusStyles.put(AttendanceStatus.PRESENT, createStatusStyle(workbook, presentBg, presentFg));
            statusStyles.put(AttendanceStatus.ABSENT, createStatusStyle(workbook, absentBg, absentFg));
            statusStyles.put(AttendanceStatus.LEAVE, createStatusStyle(workbook, leaveBg, leaveFg));
            statusStyles.put(AttendanceStatus.HALF_DAY, createStatusStyle(workbook, halfDayBg, halfDayFg));

            int rowIdx = 0;

            // Title Banner
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.setHeightInPoints(28);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("SCHOOL MANAGEMENT SYSTEM — TEACHER ATTENDANCE");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            Row subTitleRow = sheet.createRow(rowIdx++);
            subTitleRow.setHeightInPoints(20);
            Cell subTitleCell = subTitleRow.createCell(0);
            subTitleCell.setCellValue("Daily Attendance Sheet: " + date.format(DATE_FMT) +
                    (data.isSaved() ? " [Saved]" : " [Preview / Draft]"));
            subTitleCell.setCellStyle(subtitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 5));

            rowIdx++; // Blank row

            // Summary Stats Cards (2 rows: labels on top, values below)
            Row statLabelRow = sheet.createRow(rowIdx++);
            statLabelRow.setHeightInPoints(20);
            Row statValueRow = sheet.createRow(rowIdx++);
            statValueRow.setHeightInPoints(24);

            String[] statLabels = {"Total Teachers", "Present", "Absent", "On Leave", "Half-Day", "Attendance Rate"};
            double attendanceRate = data.getTotalTeachers() > 0
                    ? Math.round(((data.getPresentCount() + (data.getHalfDayCount() * 0.5)) / data.getTotalTeachers()) * 1000.0) / 10.0
                    : 0.0;
            String[] statValues = {
                    String.valueOf(data.getTotalTeachers()),
                    String.valueOf(data.getPresentCount()),
                    String.valueOf(data.getAbsentCount()),
                    String.valueOf(data.getLeaveCount()),
                    String.valueOf(data.getHalfDayCount()),
                    attendanceRate + "%"
            };

            for (int i = 0; i < statLabels.length; i++) {
                Cell lblCell = statLabelRow.createCell(i);
                lblCell.setCellValue(statLabels[i]);
                lblCell.setCellStyle(statLabelStyle);

                Cell valCell = statValueRow.createCell(i);
                valCell.setCellValue(statValues[i]);
                valCell.setCellStyle(statValueStyle);
            }

            rowIdx++; // Blank row

            // Data Table Headers
            Row tableHeaderRow = sheet.createRow(rowIdx++);
            tableHeaderRow.setHeightInPoints(24);

            String[] headers = {"#", "Teacher Name", "Username", "Email", "Status", "Remark"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = tableHeaderRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(tableHeaderStyle);
            }

            // Data Rows
            int index = 1;
            for (TeacherAttendanceResponse record : data.getRecords()) {
                Row row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(20);
                boolean isEven = (index % 2 == 0);
                XSSFCellStyle baseStyle = isEven ? zebraCellStyle : normalCellStyle;

                Cell c0 = row.createCell(0);
                c0.setCellValue(index++);
                c0.setCellStyle(centerCellStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(record.getTeacherName() != null ? record.getTeacherName() : "");
                c1.setCellStyle(baseStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(record.getTeacherUsername() != null ? record.getTeacherUsername() : "");
                c2.setCellStyle(baseStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(record.getTeacherEmail() != null ? record.getTeacherEmail() : "—");
                c3.setCellStyle(baseStyle);

                Cell c4 = row.createCell(4);
                AttendanceStatus st = record.getStatus() != null ? record.getStatus() : AttendanceStatus.PRESENT;
                c4.setCellValue(st.name());
                c4.setCellStyle(statusStyles.getOrDefault(st, baseStyle));

                Cell c5 = row.createCell(5);
                c5.setCellValue(record.getRemark() != null ? record.getRemark() : "");
                c5.setCellStyle(baseStyle);
            }

            // Auto-size columns with minimum widths
            int[] minWidths = {2000, 7500, 4500, 7000, 3800, 7500};
            for (int i = 0; i < minWidths.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < minWidths[i]) {
                    sheet.setColumnWidth(i, minWidths[i]);
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Generates an Excel attendance report for a date range (Summary Matrix + Detailed Records).
     */
    public byte[] generateRangeAttendanceExcel(LocalDate startDate, LocalDate endDate) throws IOException {
        List<User> teachers = attendanceService.getActiveTeachers();
        List<TeacherAttendance> records = attendanceRepository.findByDateRangeWithTeacher(startDate, endDate);

        // Map teacherId -> date -> record
        Map<Long, Map<LocalDate, TeacherAttendance>> matrix = new HashMap<>();
        for (TeacherAttendance r : records) {
            matrix.computeIfAbsent(r.getTeacher().getId(), k -> new HashMap<>())
                    .put(r.getAttendanceDate(), r);
        }

        List<LocalDate> dateList = new ArrayList<>();
        LocalDate curr = startDate;
        while (!curr.isAfter(endDate)) {
            dateList.add(curr);
            curr = curr.plusDays(1);
        }

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            byte[] navyRgb = new byte[]{(byte) 30, (byte) 58, (byte) 138};       // #1E3A8A
            byte[] blueRgb = new byte[]{(byte) 37, (byte) 99, (byte) 235};       // #2563EB
            byte[] lightGrayRgb = new byte[]{(byte) 243, (byte) 244, (byte) 246}; // #F3F4F6

            // Status background & text colors
            byte[] presentBg = new byte[]{(byte) 220, (byte) 252, (byte) 231};
            byte[] presentFg = new byte[]{(byte) 22, (byte) 101, (byte) 52};

            byte[] absentBg = new byte[]{(byte) 254, (byte) 226, (byte) 226};
            byte[] absentFg = new byte[]{(byte) 153, (byte) 27, (byte) 27};

            byte[] leaveBg = new byte[]{(byte) 254, (byte) 243, (byte) 199};
            byte[] leaveFg = new byte[]{(byte) 146, (byte) 64, (byte) 14};

            byte[] halfDayBg = new byte[]{(byte) 224, (byte) 242, (byte) 254};
            byte[] halfDayFg = new byte[]{(byte) 7, (byte) 89, (byte) 133};

            XSSFCellStyle titleStyle = createTitleStyle(workbook, navyRgb, 13, true);
            XSSFCellStyle subtitleStyle = createSubtitleStyle(workbook, blueRgb, 10, false);
            XSSFCellStyle tableHeaderStyle = createTableHeaderStyle(workbook, navyRgb);
            XSSFCellStyle dateHeaderStyle = createDateHeaderStyle(workbook, navyRgb);
            XSSFCellStyle normalCellStyle = createBorderedStyle(workbook, HorizontalAlignment.LEFT, false);
            XSSFCellStyle centerCellStyle = createBorderedStyle(workbook, HorizontalAlignment.CENTER, false);
            XSSFCellStyle boldCenterCellStyle = createBorderedStyle(workbook, HorizontalAlignment.CENTER, true);

            Map<AttendanceStatus, XSSFCellStyle> statusStyles = new EnumMap<>(AttendanceStatus.class);
            statusStyles.put(AttendanceStatus.PRESENT, createStatusStyle(workbook, presentBg, presentFg));
            statusStyles.put(AttendanceStatus.ABSENT, createStatusStyle(workbook, absentBg, absentFg));
            statusStyles.put(AttendanceStatus.LEAVE, createStatusStyle(workbook, leaveBg, leaveFg));
            statusStyles.put(AttendanceStatus.HALF_DAY, createStatusStyle(workbook, halfDayBg, halfDayFg));

            // ==================== SHEET 1: ATTENDANCE MATRIX ====================
            Sheet matrixSheet = workbook.createSheet("Attendance Matrix");
            matrixSheet.setDisplayGridlines(true);

            int totalCols = 3 + dateList.size() + 5; // #, Name, Username + Dates + Present, Absent, Leave, HD, %

            int mRowIdx = 0;
            Row mTitleRow = matrixSheet.createRow(mRowIdx++);
            mTitleRow.setHeightInPoints(26);
            Cell mTitleCell = mTitleRow.createCell(0);
            mTitleCell.setCellValue("TEACHER ATTENDANCE MATRIX");
            mTitleCell.setCellStyle(titleStyle);
            matrixSheet.addMergedRegion(new CellRangeAddress(0, 0, 0, Math.max(5, totalCols - 1)));

            Row mSubRow = matrixSheet.createRow(mRowIdx++);
            mSubRow.setHeightInPoints(18);
            Cell mSubCell = mSubRow.createCell(0);
            mSubCell.setCellValue("Period: " + startDate.format(DATE_FMT) + " to " + endDate.format(DATE_FMT) +
                    " | Total Active Teachers: " + teachers.size());
            mSubCell.setCellStyle(subtitleStyle);
            matrixSheet.addMergedRegion(new CellRangeAddress(1, 1, 0, Math.max(5, totalCols - 1)));

            mRowIdx++; // Blank row

            // Matrix Header
            Row mHeaderRow = matrixSheet.createRow(mRowIdx++);
            mHeaderRow.setHeightInPoints(30);

            int col = 0;
            Cell h0 = mHeaderRow.createCell(col++);
            h0.setCellValue("#");
            h0.setCellStyle(tableHeaderStyle);

            Cell h1 = mHeaderRow.createCell(col++);
            h1.setCellValue("Teacher Name");
            h1.setCellStyle(tableHeaderStyle);

            Cell h2 = mHeaderRow.createCell(col++);
            h2.setCellValue("Username");
            h2.setCellStyle(tableHeaderStyle);

            for (LocalDate d : dateList) {
                Cell dCell = mHeaderRow.createCell(col++);
                dCell.setCellValue(d.format(HEADER_DAY_FMT));
                dCell.setCellStyle(dateHeaderStyle);
            }

            Cell hPres = mHeaderRow.createCell(col++);
            hPres.setCellValue("Present");
            hPres.setCellStyle(tableHeaderStyle);

            Cell hAbs = mHeaderRow.createCell(col++);
            hAbs.setCellValue("Absent");
            hAbs.setCellStyle(tableHeaderStyle);

            Cell hLeave = mHeaderRow.createCell(col++);
            hLeave.setCellValue("Leave");
            hLeave.setCellStyle(tableHeaderStyle);

            Cell hHd = mHeaderRow.createCell(col++);
            hHd.setCellValue("Half-Day");
            hHd.setCellStyle(tableHeaderStyle);

            Cell hPct = mHeaderRow.createCell(col++);
            hPct.setCellValue("Rate %");
            hPct.setCellStyle(tableHeaderStyle);

            // Matrix Rows (per teacher)
            int teacherIndex = 1;
            int[] datePresentCounts = new int[dateList.size()];
            int[] dateAbsentCounts = new int[dateList.size()];

            for (User teacher : teachers) {
                Row row = matrixSheet.createRow(mRowIdx++);
                row.setHeightInPoints(20);
                col = 0;

                Cell cNum = row.createCell(col++);
                cNum.setCellValue(teacherIndex++);
                cNum.setCellStyle(centerCellStyle);

                Cell cName = row.createCell(col++);
                cName.setCellValue(teacher.getFullName());
                cName.setCellStyle(normalCellStyle);

                Cell cUser = row.createCell(col++);
                cUser.setCellValue(teacher.getUsername());
                cUser.setCellStyle(normalCellStyle);

                Map<LocalDate, TeacherAttendance> tRecords = matrix.getOrDefault(teacher.getId(), Collections.emptyMap());
                int pCount = 0;
                int aCount = 0;
                int lCount = 0;
                int hdCount = 0;
                int recordedCount = 0;

                for (int dIdx = 0; dIdx < dateList.size(); dIdx++) {
                    LocalDate d = dateList.get(dIdx);
                    Cell dateCell = row.createCell(col++);
                    TeacherAttendance rec = tRecords.get(d);

                    if (rec != null) {
                        recordedCount++;
                        AttendanceStatus st = rec.getStatus();
                        switch (st) {
                            case PRESENT -> {
                                pCount++;
                                datePresentCounts[dIdx]++;
                                dateCell.setCellValue("P");
                                dateCell.setCellStyle(statusStyles.get(AttendanceStatus.PRESENT));
                            }
                            case ABSENT -> {
                                aCount++;
                                dateAbsentCounts[dIdx]++;
                                dateCell.setCellValue("A");
                                dateCell.setCellStyle(statusStyles.get(AttendanceStatus.ABSENT));
                            }
                            case LEAVE -> {
                                lCount++;
                                dateCell.setCellValue("L");
                                dateCell.setCellStyle(statusStyles.get(AttendanceStatus.LEAVE));
                            }
                            case HALF_DAY -> {
                                hdCount++;
                                datePresentCounts[dIdx]++;
                                dateCell.setCellValue("HD");
                                dateCell.setCellStyle(statusStyles.get(AttendanceStatus.HALF_DAY));
                            }
                        }
                    } else {
                        dateCell.setCellValue("—");
                        dateCell.setCellStyle(centerCellStyle);
                    }
                }

                Cell cp = row.createCell(col++);
                cp.setCellValue(pCount);
                cp.setCellStyle(boldCenterCellStyle);

                Cell ca = row.createCell(col++);
                ca.setCellValue(aCount);
                ca.setCellStyle(boldCenterCellStyle);

                Cell cl = row.createCell(col++);
                cl.setCellValue(lCount);
                cl.setCellStyle(boldCenterCellStyle);

                Cell chd = row.createCell(col++);
                chd.setCellValue(hdCount);
                chd.setCellStyle(boldCenterCellStyle);

                double rate = recordedCount > 0
                        ? Math.round(((pCount + (hdCount * 0.5)) / recordedCount) * 1000.0) / 10.0
                        : 0.0;
                Cell cRate = row.createCell(col++);
                cRate.setCellValue(rate + "%");
                cRate.setCellStyle(boldCenterCellStyle);
            }

            // Summary Totals Row at the bottom
            Row totalRow = matrixSheet.createRow(mRowIdx++);
            totalRow.setHeightInPoints(22);
            col = 0;

            Cell totLabel = totalRow.createCell(col++);
            totLabel.setCellValue("TOTAL PRESENT");
            totLabel.setCellStyle(boldCenterCellStyle);

            Cell totName = totalRow.createCell(col++);
            totName.setCellValue("Across All Teachers");
            totName.setCellStyle(boldCenterCellStyle);

            Cell totUser = totalRow.createCell(col++);
            totUser.setCellValue("");
            totUser.setCellStyle(boldCenterCellStyle);

            for (int dIdx = 0; dIdx < dateList.size(); dIdx++) {
                Cell dTotal = totalRow.createCell(col++);
                dTotal.setCellValue(datePresentCounts[dIdx]);
                dTotal.setCellStyle(boldCenterCellStyle);
            }

            // Freeze header and teacher name columns
            matrixSheet.createFreezePane(3, 4);

            // Auto-size matrix columns
            matrixSheet.setColumnWidth(0, 1800); // #
            matrixSheet.setColumnWidth(1, 6800); // Name
            matrixSheet.setColumnWidth(2, 4200); // Username
            for (int i = 0; i < dateList.size(); i++) {
                matrixSheet.setColumnWidth(3 + i, 2600); // Date cols
            }
            int summaryStart = 3 + dateList.size();
            for (int i = 0; i < 5; i++) {
                matrixSheet.setColumnWidth(summaryStart + i, 2800);
            }

            // ==================== SHEET 2: DETAILED LOG ====================
            Sheet logSheet = workbook.createSheet("Detailed Log");
            logSheet.setDisplayGridlines(true);

            int lRowIdx = 0;
            Row lTitleRow = logSheet.createRow(lRowIdx++);
            lTitleRow.setHeightInPoints(24);
            Cell lTitleCell = lTitleRow.createCell(0);
            lTitleCell.setCellValue("TEACHER ATTENDANCE DETAILED RECORDS LOG (" + startDate + " to " + endDate + ")");
            lTitleCell.setCellStyle(titleStyle);
            logSheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            lRowIdx++; // Blank row

            Row lHeaderRow = logSheet.createRow(lRowIdx++);
            lHeaderRow.setHeightInPoints(24);
            String[] logHeaders = {"#", "Date", "Teacher Name", "Username", "Status", "Remark"};
            for (int i = 0; i < logHeaders.length; i++) {
                Cell cell = lHeaderRow.createCell(i);
                cell.setCellValue(logHeaders[i]);
                cell.setCellStyle(tableHeaderStyle);
            }

            int logNum = 1;
            for (TeacherAttendance rec : records) {
                Row row = logSheet.createRow(lRowIdx++);
                row.setHeightInPoints(20);

                Cell c0 = row.createCell(0);
                c0.setCellValue(logNum++);
                c0.setCellStyle(centerCellStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(rec.getAttendanceDate().format(DATE_FMT));
                c1.setCellStyle(centerCellStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(rec.getTeacher().getFullName());
                c2.setCellStyle(normalCellStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(rec.getTeacher().getUsername());
                c3.setCellStyle(normalCellStyle);

                Cell c4 = row.createCell(4);
                AttendanceStatus st = rec.getStatus();
                c4.setCellValue(st.name());
                c4.setCellStyle(statusStyles.getOrDefault(st, centerCellStyle));

                Cell c5 = row.createCell(5);
                c5.setCellValue(rec.getRemark() != null ? rec.getRemark() : "");
                c5.setCellStyle(normalCellStyle);
            }

            int[] logMinWidths = {2000, 3600, 7500, 4500, 3800, 8000};
            for (int i = 0; i < logMinWidths.length; i++) {
                logSheet.autoSizeColumn(i);
                if (logSheet.getColumnWidth(i) < logMinWidths[i]) {
                    logSheet.setColumnWidth(i, logMinWidths[i]);
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ==================== HELPER METHODS FOR STYLES ====================

    private XSSFCellStyle createTitleStyle(XSSFWorkbook wb, byte[] rgb, int fontSize, boolean bold) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) fontSize);
        font.setBold(bold);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(rgb, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private XSSFCellStyle createSubtitleStyle(XSSFWorkbook wb, byte[] rgb, int fontSize, boolean bold) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) fontSize);
        font.setBold(bold);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(rgb, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private XSSFCellStyle createStatLabelStyle(XSSFWorkbook wb, byte[] rgb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 9);
        font.setBold(true);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(rgb, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private XSSFCellStyle createStatValueStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 13);
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private XSSFCellStyle createTableHeaderStyle(XSSFWorkbook wb, byte[] rgb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 10);
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(rgb, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private XSSFCellStyle createDateHeaderStyle(XSSFWorkbook wb, byte[] rgb) {
        XSSFCellStyle style = createTableHeaderStyle(wb, rgb);
        style.setWrapText(true);
        return style;
    }

    private XSSFCellStyle createBorderedStyle(XSSFWorkbook wb, HorizontalAlignment align, boolean bold) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 10);
        font.setBold(bold);
        style.setFont(font);
        style.setAlignment(align);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private XSSFCellStyle createStatusStyle(XSSFWorkbook wb, byte[] bgRgb, byte[] fgRgb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 9);
        font.setBold(true);
        font.setColor(new XSSFColor(fgRgb, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(bgRgb, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
    }
}
