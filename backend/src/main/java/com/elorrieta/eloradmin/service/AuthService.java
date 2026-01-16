package com.elorrieta.eloradmin.service;

import com.elorrieta.eloradmin.dto.LoginRequest;
import com.elorrieta.eloradmin.dto.LoginResponse;
import com.elorrieta.eloradmin.dto.UserDTO;
import com.elorrieta.eloradmin.model.User;
import com.elorrieta.eloradmin.repository.UserRepository;
import com.elorrieta.eloradmin.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // TODO: En producción, almacenar la clave privada de forma segura
    // Por ahora, esta clave debe coincidir con la pública generada en el frontend
    private static final String PRIVATE_KEY_BASE64 = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...";
    
    /**
     * Autentica un usuario con contraseña cifrada
     */
    public LoginResponse login(LoginRequest request) {
        try {
            // 1. Buscar usuario
            User user = userRepository.findByUsername(request.getUsername())
                    .orElse(null);
            
            if (user == null) {
                return LoginResponse.failure("Usuario o contraseña incorrectos");
            }
            
            if (!user.getActive()) {
                return LoginResponse.failure("Usuario inactivo");
            }
            
            // 2. Descifrar contraseña (en producción)
            // String decryptedPassword = decryptPassword(request.getEncryptedPassword());
            
            // Por ahora, para desarrollo, asumimos que la contraseña viene en texto plano
            // o implementamos verificación directa
            String password = request.getEncryptedPassword();
            
            // 3. Verificar contraseña
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return LoginResponse.failure("Usuario o contraseña incorrectos");
            }
            
            // 4. Generar token JWT
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            
            // 5. Retornar respuesta exitosa
            UserDTO userDTO = UserDTO.fromEntity(user);
            return LoginResponse.success(userDTO, token);
            
        } catch (Exception e) {
            return LoginResponse.failure("Error en el servidor: " + e.getMessage());
        }
    }
    
    /**
     * Descifra la contraseña usando RSA (para producción)
     */
    @SuppressWarnings("unused")
    private String decryptPassword(String encryptedPassword) throws Exception {
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedPassword);
        
        // Cargar clave privada
        byte[] privateKeyBytes = Base64.getDecoder().decode(PRIVATE_KEY_BASE64);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(keySpec);
        
        // Descifrar
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWITHSHA-256ANDMGF1PADDING");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
        
        return new String(decryptedBytes);
    }
}
