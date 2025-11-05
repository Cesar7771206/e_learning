package com.e_learning.e_learning.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import com.e_learning.e_learning.model.Curso;
import com.e_learning.e_learning.model.ChatIA;

import java.util.List;

@Service
public class GeminiAIGeneratorServiceMejorado implements IAGeneratorService {

    @Value("${gemini.api.key:AIzaSyAVbBMBcIFgXSM2CUKI-UapNG1sadAC6Ps}")
    private String apiKey;

    private static final String GEMINI_API_URL = 
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAIGeneratorServiceMejorado() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String generateResponse(Curso curso, List<ChatIA> historial, String mensajeUsuario) {
        try {
            String requestBody = buildRequestBody(curso, historial, mensajeUsuario);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String url = GEMINI_API_URL + "?key=" + apiKey;
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            return extractResponse(response.getBody());

        } catch (Exception e) {
            System.err.println("❌ Error en Gemini API: " + e.getMessage());
            e.printStackTrace();
            return "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta nuevamente.";
        }
    }

    private String buildRequestBody(Curso curso, List<ChatIA> historial, String mensajeUsuario) 
            throws Exception {
        
        ObjectNode root = objectMapper.createObjectNode();

        // 🎓 System Instruction mejorado con instrucciones de evaluación
        ObjectNode systemInstruction = objectMapper.createObjectNode();
        ArrayNode systemParts = objectMapper.createArrayNode();
        ObjectNode systemPart = objectMapper.createObjectNode();
        
        String instructionText = buildSystemInstruction(curso, historial);
        systemPart.put("text", instructionText);
        
        systemParts.add(systemPart);
        systemInstruction.set("parts", systemParts);
        root.set("system_instruction", systemInstruction);

        // 💬 Contents (historial + mensaje actual)
        ArrayNode contents = objectMapper.createArrayNode();

        // Agregar historial
        if (historial != null && !historial.isEmpty()) {
            for (ChatIA chat : historial) {
                contents.add(createContent("user", chat.getMensajeUsuario()));
                contents.add(createContent("model", chat.getRespuestaIA()));
            }
        }

        // Mensaje actual del usuario
        contents.add(createContent("user", mensajeUsuario));

        root.set("contents", contents);

        return objectMapper.writeValueAsString(root);
    }

    private String buildSystemInstruction(Curso curso, List<ChatIA> historial) {
        StringBuilder instruction = new StringBuilder();
        
        instruction.append(String.format(
            "Eres un tutor IA experto y pedagógico especializado en '%s'.\n\n",
            curso.getNombre()
        ));
        
        instruction.append(String.format(
            "**Descripción del curso:** %s\n\n",
            curso.getDescripcion() != null ? curso.getDescripcion() : "Curso de aprendizaje"
        ));
        
        instruction.append("**Tu rol como tutor:**\n");
        instruction.append("1. 📚 Explicar conceptos de forma clara y progresiva\n");
        instruction.append("2. 💡 Proporcionar ejemplos prácticos y relevantes\n");
        instruction.append("3. ✅ Evaluar el aprendizaje mediante preguntas\n");
        instruction.append("4. 🎯 Identificar conceptos clave con formato **Concepto**: definición\n");
        instruction.append("5. 🔄 Retroalimentar respuestas indicando si son correctas o incorrectas\n\n");
        
        // Comportamiento según historial
        if (historial != null && !historial.isEmpty()) {
            instruction.append("**Contexto actual:**\n");
            instruction.append("Ya has tenido conversaciones previas con este estudiante. ");
            instruction.append("Inicia saludando brevemente y luego pregunta sobre conceptos ");
            instruction.append("discutidos anteriormente para evaluar su comprensión. ");
            instruction.append("Haz preguntas específicas basadas en los temas del historial.\n\n");
        } else {
            instruction.append("**Inicio de sesión:**\n");
            instruction.append("Esta es tu primera interacción con el estudiante. ");
            instruction.append("Preséntate y ofrece ayuda con el curso.\n\n");
        }
        
        instruction.append("**Formato de respuestas:**\n");
        instruction.append("- Usa **negrita** para conceptos importantes\n");
        instruction.append("- Proporciona ejemplos concretos\n");
        instruction.append("- Cuando evalúes, indica claramente si la respuesta es correcta o incorrecta\n");
        instruction.append("- Mantén un tono amigable y motivador\n");
        instruction.append("- Sé conciso pero completo (máximo 250 palabras por respuesta)\n");
        
        return instruction.toString();
    }

    private ObjectNode createContent(String role, String text) {
        ObjectNode content = objectMapper.createObjectNode();
        content.put("role", role);
        
        ArrayNode parts = objectMapper.createArrayNode();
        ObjectNode part = objectMapper.createObjectNode();
        part.put("text", text);
        parts.add(part);
        
        content.set("parts", parts);
        return content;
    }

    private String extractResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        
        if (root.has("candidates") && root.get("candidates").size() > 0) {
            JsonNode candidate = root.get("candidates").get(0);
            
            if (candidate.has("content")) {
                String text = candidate.get("content")
                    .get("parts")
                    .get(0)
                    .get("text")
                    .asText();
                
                return text;
            }
        }
        
        return "No se pudo generar una respuesta. Por favor, intenta reformular tu pregunta.";
    }
}