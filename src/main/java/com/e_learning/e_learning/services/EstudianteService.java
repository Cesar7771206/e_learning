package com.e_learning.e_learning.services;

import java.util.List;

import org.springframework.stereotype.Service;
import com.e_learning.e_learning.model.Curso;
import com.e_learning.e_learning.model.Estudiante;
import com.e_learning.e_learning.repositories.CursoRepository;
import com.e_learning.e_learning.repositories.EstudianteRepository;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final CursoRepository cursoRepository;

    public EstudianteService(EstudianteRepository estudianteRepository,
                            CursoRepository cursoRepository) {
        this.estudianteRepository = estudianteRepository;
        this.cursoRepository = cursoRepository;
    }

    // Obtener estudiante por ID
    public Estudiante getEstudiante(Long id) {
        return estudianteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
    }

    // Inscribir en curso
    public Estudiante inscribirseEnCurso(Long estudianteId, Long cursoId) {

        Estudiante estudiante = getEstudiante(estudianteId);
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Evitar inscripción duplicada
        if(estudiante.getCursos().contains(curso)) {
            throw new RuntimeException("El estudiante ya está inscrito en este curso");
        }

        estudiante.getCursos().add(curso);
        curso.getEstudiantes().add(estudiante);

        return estudianteRepository.save(estudiante);
    }

    // Lista cursos inscritos
    public List<Curso> obtenerCursos(Long estudianteId) {
        return getEstudiante(estudianteId).getCursos();
    }
}
