package com.e_learning.e_learning.model;

import jakarta.persistence.*; 
import lombok.*; 
import java.time.LocalDateTime; // Usar el tipo de dato nativo de Java para fechas

@Entity
@Table(name = "sesiones_ia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🌟 1. Usar TEXT para mensajes largos (requerido para respuestas de IA)
    @Column(columnDefinition = "TEXT")
    private String mensajeUsuario;
    
    // 🌟 1. Usar TEXT para respuestas de IA
    @Column(columnDefinition = "TEXT")
    private String respuestaIA;
    
    // 🌟 2. Usar LocalDateTime para manejo de fechas
    private LocalDateTime fecha; 

    @ManyToOne(fetch = FetchType.LAZY) // Usar LAZY para mejorar rendimiento
    @JoinColumn(name = "estudiante_id")
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    private Curso curso;
}