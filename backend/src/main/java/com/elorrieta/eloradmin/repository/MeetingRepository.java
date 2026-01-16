package com.elorrieta.eloradmin.repository;

import com.elorrieta.eloradmin.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    
    List<Meeting> findByTeacherId(Long teacherId);
    
    List<Meeting> findByStudentId(Long studentId);
    
    @Query("SELECT m FROM Meeting m WHERE m.teacher.id = :userId OR m.student.id = :userId")
    List<Meeting> findByUserId(Long userId);
    
    List<Meeting> findByStatus(Meeting.MeetingStatus status);
    
    @Query("SELECT m FROM Meeting m WHERE m.date BETWEEN :startDate AND :endDate")
    List<Meeting> findByDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT m FROM Meeting m WHERE DATE(m.date) = CURRENT_DATE")
    List<Meeting> findTodayMeetings();
    
    @Query("SELECT COUNT(m) FROM Meeting m WHERE m.status = :status")
    long countByStatus(Meeting.MeetingStatus status);
}
