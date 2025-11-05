package com.e_learning.e_learning.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.e_learning.e_learning.model.EvaluacionEstudiante;
import com.e_learning.e_learning.model.NotaEstudiante;
import com.e_learning.e_learning.services.NotasEvaluacionesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notas-evaluaciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotasEvaluacionesController {
    
    private final NotasEvaluacionesService service;
    
    @GetMapping("/notas")
    public ResponseEntity<List<NotaEstudiante>> obtenerNotas(
            @RequestParam Long estudianteId,
            @RequestParam Long cursoId) {
        return ResponseEntity.ok(service.obtenerNotas(estudianteId, cursoId));
    }
    
    @PostMapping("/notas")
    public ResponseEntity<NotaEstudiante> guardarNota(@RequestBody Map<String, Object> request) {
        Long estudianteId = ((Number) request.get("estudianteId")).longValue();
        Long cursoId = ((Number) request.get("cursoId")).longValue();
        String titulo = (String) request.get("titulo");
        String descripcion = (String) request.get("descripcion");
        String ejemplo = (String) request.get("ejemplo");
        
        return ResponseEntity.ok(service.guardarNota(estudianteId, cursoId, titulo, descripcion, ejemplo));
    }
    
    @GetMapping("/evaluaciones")
    public ResponseEntity<List<EvaluacionEstudiante>> obtenerEvaluaciones(
            @RequestParam Long estudianteId,
            @RequestParam Long cursoId) {
        return ResponseEntity.ok(service.obtenerEvaluaciones(estudianteId, cursoId));
    }
    
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(
            @RequestParam Long estudianteId,
            @RequestParam Long cursoId) {
        return ResponseEntity.ok(service.obtenerEstadisticas(estudianteId, cursoId));
    }
}