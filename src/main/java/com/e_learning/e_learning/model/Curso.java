package com.e_learning.e_learning.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.e_learning.e_learning.enums.Nivel;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    private String nombre; 
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private Nivel nivel;

    // CORREGIDO: Debe ser @ManyToMany, no @OneToMany
    // mappedBy indica que Estudiante es el dueño de la relación
    @ManyToMany(mappedBy = "cursos")
    @JsonIgnore  // Evita referencia circular en JSON
    private List<Estudiante> estudiantes = new ArrayList<>();

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL)
    @JsonIgnore  // Evita referencia circular en JSON
    private List<ChatIA> sesionesIA = new ArrayList<>();

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL)
    @JsonIgnore  // Evita referencia circular en JSON
    private List<Tutoria> tutorias = new ArrayList<>();
}