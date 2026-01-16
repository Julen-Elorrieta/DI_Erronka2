package com.elorrieta.eloradmin.controller;

import com.elorrieta.eloradmin.dto.UserDTO;
import com.elorrieta.eloradmin.model.User;
import com.elorrieta.eloradmin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * GET /api/users
     * Obtiene todos los usuarios (requiere autenticación)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('GOD', 'ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers(
            @RequestParam(required = false) String role) {
        
        if (role != null) {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            return ResponseEntity.ok(userService.getUsersByRole(userRole));
        }
        
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    /**
     * GET /api/users/{id}
     * Obtiene un usuario por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * POST /api/users
     * Crea un nuevo usuario (solo GOD y ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('GOD', 'ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody User user) {
        try {
            UserDTO createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * PUT /api/users/{id}
     * Actualiza un usuario
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GOD', 'ADMIN')")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody User user) {
        try {
            UserDTO updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * DELETE /api/users/{id}
     * Elimina un usuario (solo GOD)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GOD')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * GET /api/users/stats
     * Obtiene estadísticas de usuarios
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(userService.getStats());
    }
}
