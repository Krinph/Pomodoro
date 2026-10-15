package org.manage.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class History {
    private int id;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    private int workTime;
    private int pauseTimes;
    private int pomodoroCount;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public int getWorkTime() { return workTime; }

    public void setWorkTime(int workTime) { this.workTime = workTime; }

    public int getPauseTimes() {
        return pauseTimes;
    }

    public void setPauseTimes(int pauseTimes) {
        this.pauseTimes = pauseTimes;
    }

    public int getPomodoroCount() { return pomodoroCount; }

    public void setPomodoroCount(int pomodoroCount) { this.pomodoroCount = pomodoroCount; }
}
