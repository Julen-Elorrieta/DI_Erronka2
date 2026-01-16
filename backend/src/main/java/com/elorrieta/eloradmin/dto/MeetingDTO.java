package com.elorrieta.eloradmin.dto;

import com.elorrieta.eloradmin.model.Meeting;

import java.time.LocalDateTime;

public class MeetingDTO {
    private Long id;
    private ParticipantsDTO participants;
    private LocalDateTime date;
    private String location;
    private String reason;
    private String notes;
    private Meeting.MeetingStatus status;
    
    public MeetingDTO() {}
    
    public MeetingDTO(Long id, ParticipantsDTO participants, LocalDateTime date, String location,
                      String reason, String notes, Meeting.MeetingStatus status) {
        this.id = id;
        this.participants = participants;
        this.date = date;
        this.location = location;
        this.reason = reason;
        this.notes = notes;
        this.status = status;
    }
    
    // Getters
    public Long getId() { return id; }
    public ParticipantsDTO getParticipants() { return participants; }
    public LocalDateTime getDate() { return date; }
    public String getLocation() { return location; }
    public String getReason() { return reason; }
    public String getNotes() { return notes; }
    public Meeting.MeetingStatus getStatus() { return status; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setParticipants(ParticipantsDTO participants) { this.participants = participants; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public void setLocation(String location) { this.location = location; }
    public void setReason(String reason) { this.reason = reason; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setStatus(Meeting.MeetingStatus status) { this.status = status; }
    
    public static class ParticipantsDTO {
        private Long teacherId;
        private String teacherName;
        private Long studentId;
        private String studentName;
        
        public ParticipantsDTO() {}
        
        public ParticipantsDTO(Long teacherId, String teacherName, Long studentId, String studentName) {
            this.teacherId = teacherId;
            this.teacherName = teacherName;
            this.studentId = studentId;
            this.studentName = studentName;
        }
        
        // Getters
        public Long getTeacherId() { return teacherId; }
        public String getTeacherName() { return teacherName; }
        public Long getStudentId() { return studentId; }
        public String getStudentName() { return studentName; }
        
        // Setters
        public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
        public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
    }
    
    public static MeetingDTO fromEntity(Meeting meeting) {
        ParticipantsDTO participants = new ParticipantsDTO(
            meeting.getTeacher().getId(),
            meeting.getTeacher().getName() + " " + meeting.getTeacher().getSurname(),
            meeting.getStudent().getId(),
            meeting.getStudent().getName() + " " + meeting.getStudent().getSurname()
        );
        
        return new MeetingDTO(
            meeting.getId(),
            participants,
            meeting.getDate(),
            meeting.getLocation(),
            meeting.getReason(),
            meeting.getNotes(),
            meeting.getStatus()
        );
    }
}
