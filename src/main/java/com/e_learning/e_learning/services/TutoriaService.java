package com.e_learning.e_learning.services;

import java.sql.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.e_learning.e_learning.enums.Estado;
import com.e_learning.e_learning.model.Estudiante;
import com.e_learning.e_learning.model.Tutoria;
import com.e_learning.e_learning.model.Tutor;
import com.e_learning.e_learning.repositories.EstudianteRepository;
import com.e_learning.e_learning.repositories.TutorRepository;
import com.e_learning.e_learning.repositories.TutoriaRepository;

@Service
public class TutoriaService {

    private final TutoriaRepository tutoriaRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository;

    public TutoriaService(TutoriaRepository tutoriaRepository, 
                        EstudianteRepository estudianteRepository,
                        TutorRepository tutorRepository) {
        this.tutoriaRepository = tutoriaRepository;
        this.estudianteRepository = estudianteRepository;
        this.tutorRepository = tutorRepository;
    }

    public Tutoria reservarTutoria(Long idEstudiante, Long idTutor, String fechaHora) {

        Estudiante estudiante = estudianteRepository.findById(idEstudiante)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Tutor tutor = tutorRepository.findById(idTutor)
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        Tutoria nueva = new Tutoria();
        nueva.setEstudiante(estudiante);
        nueva.setTutor(tutor);
        nueva.setFecha(Date.valueOf(fechaHora).toLocalDate().atStartOfDay());
        nueva.setEstado(Estado.PENDIENTE);

        return tutoriaRepository.save(nueva);
    }

    public List<Tutoria> listarPorEstudiante(Long idEstudiante) {
        return tutoriaRepository.findByEstudianteId(idEstudiante);
    }

    public List<Tutoria> listarPorTutor(Long idTutor) {
        return tutoriaRepository.findByTutorId(idTutor);
    }
}
