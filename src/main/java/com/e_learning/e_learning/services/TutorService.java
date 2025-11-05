package com.e_learning.e_learning.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.e_learning.e_learning.model.Tutor;
import com.e_learning.e_learning.repositories.TutorRepository;

@Service
public class TutorService {

    private final TutorRepository tutorRepository;

    public TutorService(TutorRepository tutorRepository) {
        this.tutorRepository = tutorRepository;
    }

    public Tutor registrarTutor(Tutor tutor) {
        return tutorRepository.save(tutor);
    }

    public List<Tutor> listarTutores() {
        return tutorRepository.findAll();
    }

    public Optional<Tutor> buscarPorId(Long id) {
        return tutorRepository.findById(id);
    }
}
