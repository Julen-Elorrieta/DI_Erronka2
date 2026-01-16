package com.elorrieta.eloradmin.service;

import com.elorrieta.eloradmin.dto.MeetingDTO;
import com.elorrieta.eloradmin.model.Meeting;
import com.elorrieta.eloradmin.model.User;
import com.elorrieta.eloradmin.repository.MeetingRepository;
import com.elorrieta.eloradmin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class MeetingService {
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Obtiene todas las reuniones
     */
    public List<MeetingDTO> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(MeetingDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene una reunión por ID
     */
    public MeetingDTO getMeetingById(Long id) {
        return meetingRepository.findById(id)
                .map(MeetingDTO::fromEntity)
                .orElse(null);
    }
    
    /**
     * Obtiene reuniones de un usuario
     */
    public List<MeetingDTO> getUserMeetings(Long userId) {
        return meetingRepository.findByUserId(userId).stream()
                .map(MeetingDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene reuniones de hoy
     */
    public List<MeetingDTO> getTodayMeetings() {
        return meetingRepository.findTodayMeetings().stream()
                .map(MeetingDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Crea una nueva reunión
     */
    @Transactional
    public MeetingDTO createMeeting(Meeting meeting) {
        // Validar que el profesor existe
        User teacher = userRepository.findById(meeting.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        
        // Validar que el estudiante existe
        User student = userRepository.findById(meeting.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
        
        meeting.setTeacher(teacher);
        meeting.setStudent(student);
        
        Meeting savedMeeting = meetingRepository.save(meeting);
        return MeetingDTO.fromEntity(savedMeeting);
    }
    
    /**
     * Actualiza el estado de una reunión
     */
    @Transactional
    public MeetingDTO updateMeetingStatus(Long id, Meeting.MeetingStatus status) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reunión no encontrada"));
        
        meeting.setStatus(status);
        Meeting savedMeeting = meetingRepository.save(meeting);
        return MeetingDTO.fromEntity(savedMeeting);
    }
    
    /**
     * Elimina una reunión
     */
    @Transactional
    public void deleteMeeting(Long id) {
        if (!meetingRepository.existsById(id)) {
            throw new RuntimeException("Reunión no encontrada");
        }
        meetingRepository.deleteById(id);
    }
}
