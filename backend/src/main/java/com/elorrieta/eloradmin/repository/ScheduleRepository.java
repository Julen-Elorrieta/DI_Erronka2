package com.elorrieta.eloradmin.repository;

import com.elorrieta.eloradmin.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    
    List<Schedule> findByUserId(Long userId);
    
    List<Schedule> findByDayOfWeek(DayOfWeek dayOfWeek);
    
    List<Schedule> findByUserIdAndDayOfWeek(Long userId, DayOfWeek dayOfWeek);
}
