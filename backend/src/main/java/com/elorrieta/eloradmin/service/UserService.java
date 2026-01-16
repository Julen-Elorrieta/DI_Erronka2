package com.elorrieta.eloradmin.service;

import com.elorrieta.eloradmin.dto.UserDTO;
import com.elorrieta.eloradmin.model.User;
import com.elorrieta.eloradmin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Obtiene todos los usuarios
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene un usuario por ID
     */
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(UserDTO::fromEntity)
                .orElse(null);
    }
    
    /**
     * Obtiene usuarios por rol
     */
    public List<UserDTO> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Crea un nuevo usuario
     */
    @Transactional
    public UserDTO createUser(User user) {
        // Validar username único
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("El username ya existe");
        }
        
        // Validar email único
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("El email ya existe");
        }
        
        // Encriptar contraseña
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }
    
    /**
     * Actualiza un usuario
     */
    @Transactional
    public UserDTO updateUser(Long id, User userUpdate) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Actualizar campos
        if (userUpdate.getName() != null) user.setName(userUpdate.getName());
        if (userUpdate.getSurname() != null) user.setSurname(userUpdate.getSurname());
        if (userUpdate.getEmail() != null) user.setEmail(userUpdate.getEmail());
        if (userUpdate.getPhone() != null) user.setPhone(userUpdate.getPhone());
        if (userUpdate.getPhoto() != null) user.setPhoto(userUpdate.getPhoto());
        if (userUpdate.getRole() != null) user.setRole(userUpdate.getRole());
        if (userUpdate.getActive() != null) user.setActive(userUpdate.getActive());
        
        // Si se actualiza la contraseña
        if (userUpdate.getPassword() != null && !userUpdate.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userUpdate.getPassword()));
        }
        
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }
    
    /**
     * Elimina un usuario
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // No permitir eliminar usuario GOD
        if (user.getRole() == User.UserRole.GOD) {
            throw new RuntimeException("No se puede eliminar el usuario GOD");
        }
        
        userRepository.delete(user);
    }
    
    /**
     * Obtiene estadísticas de usuarios
     */
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.countByRoleAndActive(User.UserRole.STUDENT));
        stats.put("totalTeachers", userRepository.countByRoleAndActive(User.UserRole.TEACHER));
        return stats;
    }
}
