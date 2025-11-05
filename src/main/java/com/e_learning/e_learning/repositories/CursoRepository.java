package com.e_learning.e_learning.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.e_learning.e_learning.model.Curso;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    
}
