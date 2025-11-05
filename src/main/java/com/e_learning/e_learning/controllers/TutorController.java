package com.e_learning.e_learning.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.*;

import com.e_learning.e_learning.model.Tutor;
import com.e_learning.e_learning.services.TutorService;

@RestController
@RequestMapping("/api/tutores")
public class TutorController {

    private final TutorService tutorService;

    public TutorController(TutorService tutorService) {
        this.tutorService = tutorService;
    }

    @PostMapping("/registro")
    public Tutor registrarTutor(@RequestParam String nombre,
                                @RequestParam String correo,
                                @RequestParam String password,
                                @RequestParam String especialidad,
                                @RequestParam String descripcion) {

        Tutor tutor = new Tutor();
        tutor.setNombre(nombre);
        tutor.setCorreo(correo);
        tutor.setPassword(password);
        tutor.setEspecialidad(especialidad);
        tutor.setDescripcion(descripcion);

        return tutorService.registrarTutor(tutor);
    }

    @GetMapping
    public List<Tutor> listarTutores() {
        return tutorService.listarTutores();
    }

    @GetMapping("/{id}")
    public Optional<Tutor> buscarPorId(@PathVariable Long id) {
        return tutorService.buscarPorId(id);
    }
}

