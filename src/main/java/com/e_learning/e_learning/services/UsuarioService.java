package com.e_learning.e_learning.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.e_learning.e_learning.enums.Rol;
import com.e_learning.e_learning.model.Estudiante;
import com.e_learning.e_learning.model.Tutor;
import com.e_learning.e_learning.model.Usuario;
import com.e_learning.e_learning.repositories.UsuarioRepository;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    } 

    public Usuario login(String correo, String password) {
        return usuarioRepository.findByCorreoAndPassword(correo, password);
    } 

    public Usuario registrar(String nombre, String correo, String password, String rol) {
        Usuario nuevoUsuario;
        
        if (rol.equals("ESTUDIANTE")) {
            nuevoUsuario = new Estudiante();
            nuevoUsuario.setRol(Rol.ESTUDIANTE); // ✅ AGREGADO
        } else if (rol.equals("TUTOR")) {
            nuevoUsuario = new Tutor();
            nuevoUsuario.setRol(Rol.TUTOR); // ✅ AGREGADO
        } else {
            throw new IllegalArgumentException("Rol no válido");
        }
        
        nuevoUsuario.setNombre(nombre);
        nuevoUsuario.setCorreo(correo);
        nuevoUsuario.setPassword(password);
        
        return usuarioRepository.save(nuevoUsuario);
    } 

    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario getUsuarioById(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }
}