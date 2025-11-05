package com.e_learning.e_learning.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.e_learning.e_learning.model.EvaluacionEstudiante;
import java.util.List;

@Repository
public interface EvaluacionEstudianteRepository extends JpaRepository<EvaluacionEstudiante, Long> {
    
    List<EvaluacionEstudiante> findByEstudianteIdAndCursoId(Long estudianteId, Long cursoId);
    
    List<EvaluacionEstudiante> findByEstudianteIdOrderByFechaEvaluacionDesc(Long estudianteId);
    
    @Query("SELECT AVG(e.puntuacion) FROM EvaluacionEstudiante e WHERE e.estudiante.id = :estudianteId AND e.curso.id = :cursoId")
    Double calcularPromedioEvaluaciones(Long estudianteId, Long cursoId);
    
    @Query("SELECT COUNT(e) FROM EvaluacionEstudiante e WHERE e.estudiante.id = :estudianteId AND e.curso.id = :cursoId AND e.esCorrecta = true")
    Long contarRespuestasCorrectas(Long estudianteId, Long cursoId);
}