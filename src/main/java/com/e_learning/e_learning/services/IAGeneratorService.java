package com.e_learning.e_learning.services;

import com.e_learning.e_learning.model.Curso;
import com.e_learning.e_learning.model.ChatIA; 
import java.util.List;

public interface IAGeneratorService {
    String generateResponse(Curso curso, List<ChatIA> historialConversacion, String mensajeUsuario);
}