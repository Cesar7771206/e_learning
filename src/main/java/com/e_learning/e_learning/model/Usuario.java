package com.e_learning.e_learning.model;

import com.e_learning.e_learning.enums.Rol;

import jakarta.persistence.*;
import lombok.*; 

@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
@Data 
@NoArgsConstructor
@AllArgsConstructor 
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String correo;
    
    private String password;
    @Enumerated(EnumType.STRING) 
    private Rol rol; 
}
