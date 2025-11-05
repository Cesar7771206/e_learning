package com.e_learning.e_learning.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.e_learning.e_learning.model.ChatIA;

public interface ChatIARepository extends JpaRepository<ChatIA, Long> {

    List<ChatIA> findByEstudianteIdAndCursoId(Long estudianteId, Long cursoId);
}
