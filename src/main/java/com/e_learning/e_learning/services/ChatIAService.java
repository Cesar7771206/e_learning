package com.e_learning.e_learning.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

import com.e_learning.e_learning.model.ChatIA;
import com.e_learning.e_learning.model.Curso;
import com.e_learning.e_learning.model.Estudiante;
import com.e_learning.e_learning.repositories.ChatIARepository;
import com.e_learning.e_learning.repositories.CursoRepository;
import com.e_learning.e_learning.repositories.EstudianteRepository;

@Service
public class ChatIAService {

    private final ChatIARepository chatIARepository;
    private final EstudianteRepository estudianteRepository;
    private final CursoRepository cursoRepository;
    private final IAGeneratorService iaGeneratorService; // 👈 Nuevo

    public ChatIAService(ChatIARepository chatIARepository,
                        EstudianteRepository estudianteRepository,
                        CursoRepository cursoRepository,
                        IAGeneratorService iaGeneratorService) { // 👈 Nuevo parámetro
        this.chatIARepository = chatIARepository;
        this.estudianteRepository = estudianteRepository;
        this.cursoRepository = cursoRepository;
        this.iaGeneratorService = iaGeneratorService;
    }

    public ChatIA enviarMensaje(Long idEstudiante, Long idCurso, String mensajeUsuario) {

        // ... (Tu código de validación de Estudiante/Curso con RuntimeException) ...
        Estudiante estudiante = estudianteRepository.findById(idEstudiante)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Validar inscripción
        if (!estudiante.getCursos().contains(curso)) {
            throw new RuntimeException("El estudiante no está inscrito en este curso");
        }
        
        // 🌟 PASO CLAVE 1: Obtener el historial
        List<ChatIA> historial = obtenerHistorial(idEstudiante, idCurso);

        // 🌟 PASO CLAVE 2: Llamar a la IA con el historial
        String respuestaIA = iaGeneratorService.generateResponse(curso, historial, mensajeUsuario);

        ChatIA chat = new ChatIA();
        chat.setEstudiante(estudiante);
        chat.setCurso(curso);
        chat.setMensajeUsuario(mensajeUsuario);
        chat.setRespuestaIA(respuestaIA);
        // 🌟 Usar LocalDateTime (si actualizaste el modelo)
        chat.setFecha(LocalDateTime.now()); 

        return chatIARepository.save(chat);
    }

    public List<ChatIA> obtenerHistorial(Long idEstudiante, Long idCurso) {
        return chatIARepository.findByEstudianteIdAndCursoId(idEstudiante, idCurso);
    }
}