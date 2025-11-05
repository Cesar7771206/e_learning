package com.e_learning.e_learning.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.e_learning.e_learning.model.NotaEstudiante;
import java.util.List;

@Repository
public interface NotaEstudianteRepository extends JpaRepository<NotaEstudiante, Long> {
    
    List<NotaEstudiante> findByEstudianteIdAndCursoId(Long estudianteId, Long cursoId);
    
    List<NotaEstudiante> findByEstudianteIdOrderByFechaCreacionDesc(Long estudianteId);
    
    void deleteByEstudianteIdAndCursoId(Long estudianteId, Long cursoId);
}