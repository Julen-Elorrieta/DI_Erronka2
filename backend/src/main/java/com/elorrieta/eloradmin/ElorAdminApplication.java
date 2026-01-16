package com.elorrieta.eloradmin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ElorAdminApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ElorAdminApplication.class, args);
        System.out.println("\n" +
                "╔══════════════════════════════════════════════════════════╗\n" +
                "║                                                          ║\n" +
                "║          🎓 ELORADMIN API - SERVIDOR INICIADO 🎓         ║\n" +
                "║                                                          ║\n" +
                "║  Puerto: 3000                                            ║\n" +
                "║  Contexto: /api                                          ║\n" +
                "║  Base de datos: elordb @ 10.5.104.100:3306              ║\n" +
                "║                                                          ║\n" +
                "║  Endpoints disponibles:                                  ║\n" +
                "║    - POST /api/auth/login                                ║\n" +
                "║    - GET  /api/users                                     ║\n" +
                "║    - GET  /api/meetings                                  ║\n" +
                "║                                                          ║\n" +
                "║  Swagger UI: http://localhost:3000/api/swagger-ui.html  ║\n" +
                "║                                                          ║\n" +
                "╚══════════════════════════════════════════════════════════╝\n");
    }
}
