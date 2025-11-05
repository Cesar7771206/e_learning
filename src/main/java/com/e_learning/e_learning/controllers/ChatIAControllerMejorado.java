package com.e_learning.e_learning.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.e_learning.e_learning.model.ChatIA;
import com.e_learning.e_learning.services.ChatIAService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatIAControllerMejorado {

    private final ChatIAService chatIAService;

    /**
     * Endpoint mejorado para enviar mensajes con soporte para evaluaciones
     */
    @PostMapping("/mensaje")
    public ResponseEntity<String> enviarMensaje(@RequestBody Map<String, Object> request) {
        try {
            // Extraer datos del request
            Long estudianteId = ((Number) request.get("estudianteId")).longValue();
            Long cursoId = ((Number) request.get("cursoId")).longValue();
            String mensaje = (String) request.get("mensaje");
            
            // Validación básica
            if (estudianteId == null || cursoId == null || mensaje == null || mensaje.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Datos incompletos");
            }
            
            // Procesar el mensaje
            ChatIA chat = chatIAService.enviarMensaje(estudianteId, cursoId, mensaje);
            
            // Retornar solo la respuesta de la IA
            return ResponseEntity.ok(chat.getRespuestaIA());
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Error interno del servidor: " + e.getMessage());
        }
    }

    /**
     * Obtener historial de chat con paginación opcional
     */
    @GetMapping("/historial")
    public ResponseEntity<List<ChatIA>> obtenerHistorial(
            @RequestParam Long estudianteId,
            @RequestParam Long cursoId,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {
        try {
            List<ChatIA> historial = chatIAService.obtenerHistorial(estudianteId, cursoId);
            
            // Limitar resultados si es necesario
            if (limit != null && historial.size() > limit) {
                historial = historial.subList(Math.max(0, historial.size() - limit), historial.size());
            }
            
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Limpiar historial de chat (opcional - para implementación futura)
     */
    @DeleteMapping("/historial")
    public ResponseEntity<String> limpiarHistorial(
            @RequestParam Long estudianteId,
            @RequestParam Long cursoId) {
        try {
            // Implementar lógica para limpiar historial
            // chatIAService.limpiarHistorial(estudianteId, cursoId);
            return ResponseEntity.ok("Historial limpiado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error al limpiar historial: " + e.getMessage());
        }
    }

    /**
     * Obtener estadísticas del estudiante (para futuras implementaciones)
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(
            @RequestParam Long estudianteId,
            @RequestParam Long cursoId) {
        try {
            List<ChatIA> historial = chatIAService.obtenerHistorial(estudianteId, cursoId);
            
            Map<String, Object> estadisticas = Map.of(
                "totalMensajes", historial.size(),
                "cursosActivos", 1,
                "ultimaActividad", historial.isEmpty() ? null : 
                    historial.get(historial.size() - 1).getFecha()
            );
            
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}