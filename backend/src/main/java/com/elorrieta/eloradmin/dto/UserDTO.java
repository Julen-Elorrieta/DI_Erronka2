package com.elorrieta.eloradmin.dto;

import com.elorrieta.eloradmin.model.User;

public class UserDTO {
    private Long id;
    private String username;
    private String name;
    private String surname;
    private String email;
    private String phone;
    private String photo;
    private User.UserRole role;
    private Boolean active;
    
    public UserDTO() {}
    
    public UserDTO(Long id, String username, String name, String surname, String email,
                   String phone, String photo, User.UserRole role, Boolean active) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phone = phone;
        this.photo = photo;
        this.role = role;
        this.active = active;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getSurname() { return surname; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getPhoto() { return photo; }
    public User.UserRole getRole() { return role; }
    public Boolean getActive() { return active; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setName(String name) { this.name = name; }
    public void setSurname(String surname) { this.surname = surname; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setPhoto(String photo) { this.photo = photo; }
    public void setRole(User.UserRole role) { this.role = role; }
    public void setActive(Boolean active) { this.active = active; }
    
    public static UserDTO fromEntity(User user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getSurname(),
            user.getEmail(),
            user.getPhone(),
            user.getPhoto(),
            user.getRole(),
            user.getActive()
        );
    }
}
