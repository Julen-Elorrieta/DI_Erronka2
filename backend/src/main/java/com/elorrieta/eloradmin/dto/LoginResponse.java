package com.elorrieta.eloradmin.dto;

public class LoginResponse {
    private boolean success;
    private UserDTO user;
    private String token;
    private String message;
    
    public LoginResponse() {}
    
    public LoginResponse(boolean success, UserDTO user, String token, String message) {
        this.success = success;
        this.user = user;
        this.token = token;
        this.message = message;
    }
    
    // Getters
    public boolean isSuccess() { return success; }
    public UserDTO getUser() { return user; }
    public String getToken() { return token; }
    public String getMessage() { return message; }
    
    // Setters
    public void setSuccess(boolean success) { this.success = success; }
    public void setUser(UserDTO user) { this.user = user; }
    public void setToken(String token) { this.token = token; }
    public void setMessage(String message) { this.message = message; }
    
    public static LoginResponse success(UserDTO user, String token) {
        return new LoginResponse(true, user, token, "Login exitoso");
    }
    
    public static LoginResponse failure(String message) {
        return new LoginResponse(false, null, null, message);
    }
}
