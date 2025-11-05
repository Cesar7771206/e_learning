package com.e_learning.e_learning.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.e_learning.e_learning.model.Tutoria;

public interface TutoriaRepository extends JpaRepository<Tutoria, Long> {

    List<Tutoria> findByEstudianteId(Long estudianteId);

    List<Tutoria> findByTutorId(Long tutorId);
}