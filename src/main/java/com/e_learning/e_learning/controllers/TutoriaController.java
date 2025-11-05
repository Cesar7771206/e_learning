package com.e_learning.e_learning.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.e_learning.e_learning.model.Tutoria;
import com.e_learning.e_learning.services.TutoriaService;

@RestController
@RequestMapping("/api/tutorias")
public class TutoriaController {

    private final TutoriaService tutoriaService;

    public TutoriaController(TutoriaService tutoriaService) {
        this.tutoriaService = tutoriaService;
    }

    @PostMapping("/reservar")
    public Tutoria reservarTutoria(
            @RequestParam Long idEstudiante,
            @RequestParam Long idTutor,
            @RequestParam String fechaHora) {

        return tutoriaService.reservarTutoria(idEstudiante, idTutor, fechaHora);
    }

    @GetMapping("/estudiante/{idEstudiante}")
    public List<Tutoria> obtenerTutoriasEstudiante(@PathVariable Long idEstudiante) {
        return tutoriaService.listarPorEstudiante(idEstudiante);
    }

    @GetMapping("/tutor/{idTutor}")
    public List<Tutoria> obtenerTutoriasTutor(@PathVariable Long idTutor) {
        return tutoriaService.listarPorTutor(idTutor);
    }
}
