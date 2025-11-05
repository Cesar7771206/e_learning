package com.e_learning.e_learning.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;


@Entity
@Table(name = "tutores")
@PrimaryKeyJoinColumn(name = "idUsuario")

public class Tutor  extends Usuario {
    
    private String especialidad;
    private String descripcion; 
    private double tarifaHora;
    
    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL)
    private List<Tutoria> tutorias;


    //Constructores
    public Tutor() {
        super();
    }
    public Tutor(String especialidad, String descripcion, double tarifaHora) {
        super();
        this.especialidad = especialidad;
        this.descripcion = descripcion;
        this.tarifaHora = tarifaHora;
    }

    // Getters and Setters
    public String getEspecialidad() {
        return especialidad;
    }
    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public double getTarifaHora() {
        return tarifaHora;
    }
    public void setTarifaHora(double tarifaHora) {
        this.tarifaHora = tarifaHora;
    }
}
