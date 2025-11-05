
package com.e_learning.e_learning.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "evaluaciones_estudiante")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionEstudiante {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;
    
    @ManyToOne
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String pregunta;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String respuestaEstudiante;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String retroalimentacionIA;
    
    @Column(name = "es_correcta")
    private Boolean esCorrecta;
    
    @Column(name = "puntuacion")
    private Integer puntuacion; // Opcional: 0-100
    
    @Column(name = "fecha_evaluacion", nullable = false)
    private LocalDateTime fechaEvaluacion;
    
    @PrePersist
    protected void onCreate() {
        fechaEvaluacion = LocalDateTime.now();
    }
}