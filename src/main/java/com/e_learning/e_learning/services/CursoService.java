package com.e_learning.e_learning.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.e_learning.e_learning.model.Curso;
import com.e_learning.e_learning.model.Estudiante;
import com.e_learning.e_learning.repositories.CursoRepository;
import com.e_learning.e_learning.repositories.EstudianteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final EstudianteRepository estudianteRepository;

    // Listar todos los cursos
    public List<Curso> listarCursos() {
        return cursoRepository.findAll();
    }

    // Obtener curso por ID
    public Curso obtenerPorId(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado con id: " + id));
    }

    // Guardar/Crear curso
    public Curso guardar(Curso curso) {
        return cursoRepository.save(curso);
    }

    // Inscribir estudiante en curso
    @Transactional
    public void inscribirEstudiante(Long cursoId, Long estudianteId) {
        Curso curso = obtenerPorId(cursoId);
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + estudianteId));

        // Verificar que no esté ya inscrito
        if (estudiante.getCursos().contains(curso)) {
            throw new RuntimeException("El estudiante ya está inscrito en este curso");
        }

        // Agregar relación bidireccional
        estudiante.getCursos().add(curso);
        curso.getEstudiantes().add(estudiante);

        // Guardar cambios
        estudianteRepository.save(estudiante);
    }

    // Eliminar curso
    public void eliminar(Long id) {
        cursoRepository.deleteById(id);
    }
}