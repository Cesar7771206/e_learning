package com.e_learning.e_learning.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "estudiantes")
@PrimaryKeyJoinColumn(name = "idUsuario")
public class Estudiante extends Usuario {
    
    private String carrera; 
    private String universidad; 
    
    // Relación ManyToMany con Curso
    @ManyToMany
    @JoinTable(
        name = "estudiantes_cursos", 
        joinColumns = @JoinColumn(name = "estudiante_id"), 
        inverseJoinColumns = @JoinColumn(name = "curso_id")
    )
    private List<Curso> cursos = new ArrayList<>(); 

    @OneToMany(mappedBy = "estudiante", cascade = CascadeType.ALL)
    @JsonIgnore  // Evita referencia circular
    private List<ChatIA> sesionesIA = new ArrayList<>();

    @OneToMany(mappedBy = "estudiante", cascade = CascadeType.ALL)
    @JsonIgnore  // Evita referencia circular
    private List<Tutoria> tutorias = new ArrayList<>();


    // Constructores
    public Estudiante() {
        super();
    }

    public Estudiante(String carrera, String universidad) {
        super();
        this.carrera = carrera;
        this.universidad = universidad;
    }


    // Getters and Setters
    public String getCarrera() {
        return carrera;
    }
    
    public void setCarrera(String carrera) {
        this.carrera = carrera;
    }

    public String getUniversidad() {
        return universidad;
    }
    
    public void setUniversidad(String universidad) {
        this.universidad = universidad;
    }

    public List<Curso> getCursos() {
        return cursos;
    }

    public void setCursos(List<Curso> cursos) {
        this.cursos = cursos;
    }

    public List<ChatIA> getSesionesIA() {
        return sesionesIA;
    }

    public void setSesionesIA(List<ChatIA> sesionesIA) {
        this.sesionesIA = sesionesIA;
    }

    public List<Tutoria> getTutorias() {
        return tutorias;
    }

    public void setTutorias(List<Tutoria> tutorias) {
        this.tutorias = tutorias;
    }
}