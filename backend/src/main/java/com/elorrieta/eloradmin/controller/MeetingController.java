package com.elorrieta.eloradmin.controller;

import com.elorrieta.eloradmin.dto.MeetingDTO;
import com.elorrieta.eloradmin.model.Meeting;
import com.elorrieta.eloradmin.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {
    
    @Autowired
    private MeetingService meetingService;
    
    /**
     * GET /api/meetings
     * Obtiene todas las reuniones o filtra por usuario
     */
    @GetMapping
    public ResponseEntity<List<MeetingDTO>> getMeetings(
            @RequestParam(required = false) Long userId) {
        
        if (userId != null) {
            return ResponseEntity.ok(meetingService.getUserMeetings(userId));
        }
        
        return ResponseEntity.ok(meetingService.getAllMeetings());
    }
    
    /**
     * GET /api/meetings/today
     * Obtiene las reuniones de hoy
     */
    @GetMapping("/today")
    public ResponseEntity<List<MeetingDTO>> getTodayMeetings() {
        return ResponseEntity.ok(meetingService.getTodayMeetings());
    }
    
    /**
     * GET /api/meetings/{id}
     * Obtiene una reunión por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<MeetingDTO> getMeetingById(@PathVariable Long id) {
        MeetingDTO meeting = meetingService.getMeetingById(id);
        
        if (meeting == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(meeting);
    }
    
    /**
     * POST /api/meetings
     * Crea una nueva reunión
     */
    @PostMapping
    public ResponseEntity<MeetingDTO> createMeeting(@RequestBody Meeting meeting) {
        try {
            MeetingDTO createdMeeting = meetingService.createMeeting(meeting);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMeeting);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * PATCH /api/meetings/{id}/status
     * Actualiza el estado de una reunión
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<MeetingDTO> updateMeetingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            Meeting.MeetingStatus status = Meeting.MeetingStatus.valueOf(body.get("status"));
            MeetingDTO updatedMeeting = meetingService.updateMeetingStatus(id, status);
            return ResponseEntity.ok(updatedMeeting);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * DELETE /api/meetings/{id}
     * Elimina una reunión
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        try {
            meetingService.deleteMeeting(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
