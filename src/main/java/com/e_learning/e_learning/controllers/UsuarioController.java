package com.e_learning.e_learning.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*; 

import com.e_learning.e_learning.model.Usuario;
import com.e_learning.e_learning.services.UsuarioService;


@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    } 
    
    @GetMapping
    public List<Usuario> getAll() {
        return usuarioService.getAllUsuarios();
    }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id) {
        return usuarioService.getUsuarioById(id);
    }

    @PostMapping("/login")
    public Usuario login(@RequestParam String correo, @RequestParam String password) {
        return usuarioService.login(correo, password);
    }

    // Registro
    @PostMapping("/registro")
    public Usuario registrar(@RequestParam String nombre, @RequestParam String correo,
                            @RequestParam String password, @RequestParam String rol) {
        return usuarioService.registrar(nombre, correo, password, rol);
    }
}
