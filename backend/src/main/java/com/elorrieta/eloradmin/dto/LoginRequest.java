package com.elorrieta.eloradmin.dto;

public class LoginRequest {
    private String username;
    private String encryptedPassword;
    
    public LoginRequest() {}
    
    public LoginRequest(String username, String encryptedPassword) {
        this.username = username;
        this.encryptedPassword = encryptedPassword;
    }
    
    // Getters
    public String getUsername() { return username; }
    public String getEncryptedPassword() { return encryptedPassword; }
    
    // Setters
    public void setUsername(String username) { this.username = username; }
    public void setEncryptedPassword(String encryptedPassword) { this.encryptedPassword = encryptedPassword; }
}
