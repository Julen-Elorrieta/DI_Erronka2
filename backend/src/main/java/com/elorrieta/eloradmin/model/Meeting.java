package com.elorrieta.eloradmin.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
public class Meeting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @Column(nullable = false)
    private LocalDateTime date;
    
    @Column(length = 100)
    private String location;
    
    @Column(length = 500)
    private String reason;
    
    @Column(length = 1000)
    private String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MeetingStatus status = MeetingStatus.PENDING;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public Meeting() {}
    
    public Meeting(Long id, User teacher, User student, LocalDateTime date, String location,
                   String reason, String notes, MeetingStatus status, LocalDateTime createdAt,
                   LocalDateTime updatedAt) {
        this.id = id;
        this.teacher = teacher;
        this.student = student;
        this.date = date;
        this.location = location;
        this.reason = reason;
        this.notes = notes;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters
    public Long getId() { return id; }
    public User getTeacher() { return teacher; }
    public User getStudent() { return student; }
    public LocalDateTime getDate() { return date; }
    public String getLocation() { return location; }
    public String getReason() { return reason; }
    public String getNotes() { return notes; }
    public MeetingStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTeacher(User teacher) { this.teacher = teacher; }
    public void setStudent(User student) { this.student = student; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public void setLocation(String location) { this.location = location; }
    public void setReason(String reason) { this.reason = reason; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum MeetingStatus {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED
    }
}
