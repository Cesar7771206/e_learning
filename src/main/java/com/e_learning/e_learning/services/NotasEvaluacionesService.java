package com.e_learning.e_learning.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.e_learning.e_learning.model.*;
import com.e_learning.e_learning.repositories.*;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotasEvaluacionesService {
    
    private final NotaEstudianteRepository notaRepository;
    private final EvaluacionEstudianteRepository evaluacionRepository;
    private final EstudianteRepository estudianteRepository;
    private final CursoRepository cursoRepository;
    
    /**
     * Guardar una nota del estudiante
     */
    @Transactional
    public NotaEstudiante guardarNota(Long estudianteId, Long cursoId, String titulo, String descripcion, String ejemplo) {
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
            .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
        
        Curso curso = cursoRepository.findById(cursoId)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        NotaEstudiante nota = new NotaEstudiante();
        nota.setEstudiante(estudiante);
        nota.setCurso(curso);
        nota.setTitulo(titulo);
        nota.setDescripcion(descripcion);
        nota.setEjemplo(ejemplo);
        
        return notaRepository.save(nota);
    }
    
    /**
     * Obtener todas las notas de un estudiante en un curso
     */
    public List<NotaEstudiante> obtenerNotas(Long estudianteId, Long cursoId) {
        return notaRepository.findByEstudianteIdAndCursoId(estudianteId, cursoId);
    }
    
    /**
     * Guardar una evaluación del estudiante
     */
    @Transactional
    public EvaluacionEstudiante guardarEvaluacion(Long estudianteId, Long cursoId, 
            String pregunta, String respuestaEstudiante, String retroalimentacion, Boolean esCorrecta) {
        
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
            .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
        
        Curso curso = cursoRepository.findById(cursoId)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        EvaluacionEstudiante evaluacion = new EvaluacionEstudiante();
        evaluacion.setEstudiante(estudiante);
        evaluacion.setCurso(curso);
        evaluacion.setPregunta(pregunta);
        evaluacion.setRespuestaEstudiante(respuestaEstudiante);
        evaluacion.setRetroalimentacionIA(retroalimentacion);
        evaluacion.setEsCorrecta(esCorrecta);
        evaluacion.setPuntuacion(esCorrecta ? 100 : 0);
        
        return evaluacionRepository.save(evaluacion);
    }
    
    /**
     * Obtener todas las evaluaciones de un estudiante en un curso
     */
    public List<EvaluacionEstudiante> obtenerEvaluaciones(Long estudianteId, Long cursoId) {
        return evaluacionRepository.findByEstudianteIdAndCursoId(estudianteId, cursoId);
    }
    
    /**
     * Obtener estadísticas de progreso del estudiante
     */
    public Map<String, Object> obtenerEstadisticas(Long estudianteId, Long cursoId) {
        Double promedio = evaluacionRepository.calcularPromedioEvaluaciones(estudianteId, cursoId);
        Long correctas = evaluacionRepository.contarRespuestasCorrectas(estudianteId, cursoId);
        Long totalNotas = (long) notaRepository.findByEstudianteIdAndCursoId(estudianteId, cursoId).size();
        Long totalEvaluaciones = (long) evaluacionRepository.findByEstudianteIdAndCursoId(estudianteId, cursoId).size();
        
        return Map.of(
            "promedioEvaluaciones", promedio != null ? promedio : 0.0,
            "respuestasCorrectas", correctas,
            "totalEvaluaciones", totalEvaluaciones,
            "totalNotas", totalNotas,
            "porcentajeAcierto", totalEvaluaciones > 0 ? (correctas * 100.0 / totalEvaluaciones) : 0.0
        );
    }
}