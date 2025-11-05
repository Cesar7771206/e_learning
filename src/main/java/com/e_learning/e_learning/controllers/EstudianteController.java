package com.e_learning.e_learning.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.e_learning.e_learning.model.Curso;
import com.e_learning.e_learning.model.Estudiante;
import com.e_learning.e_learning.services.CursoService;
import com.e_learning.e_learning.services.EstudianteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/estudiantes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EstudianteController {

    private final EstudianteService estudianteService;
    private final CursoService cursoService;

    // Obtener estudiante por ID
    @GetMapping("/{id}")
    public ResponseEntity<Estudiante> getEstudiante(@PathVariable Long id) {
        try {
            Estudiante estudiante = estudianteService.getEstudiante(id);
            return ResponseEntity.ok(estudiante);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Inscribir estudiante en un curso
    @PostMapping("/{estudianteId}/inscribir/{cursoId}")
    public ResponseEntity<String> inscribir(
            @PathVariable Long estudianteId,
            @PathVariable Long cursoId) {
        try {
            cursoService.inscribirEstudiante(cursoId, estudianteId);
            return ResponseEntity.ok("Estudiante inscrito exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Obtener cursos de un estudiante
    @GetMapping("/{estudianteId}/cursos")
    public ResponseEntity<List<Curso>> obtenerCursos(@PathVariable Long estudianteId) {
        try {
            List<Curso> cursos = estudianteService.obtenerCursos(estudianteId);
            return ResponseEntity.ok(cursos);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}