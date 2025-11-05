const API_URL = 'http://localhost:8080/api';

let usuario = null;
let curso = null;
let historial = [];
let conceptos = [];
let evaluaciones = [];
let sesionIniciada = false;

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const chatForm = document.getElementById('chatForm');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const charCount = document.getElementById('charCount');
const notesPanel = document.getElementById('notesPanel');

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    setupNoteTabs();
});

// ===== AUTENTICACIÓN =====
function checkAuth() {
    const userStr = localStorage.getItem('usuario');
    const cursoStr = localStorage.getItem('cursoActual');
    
    if (!userStr || !cursoStr) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    usuario = JSON.parse(userStr);
    curso = JSON.parse(cursoStr);
    
    document.getElementById('cursoNombre').textContent = curso.nombre;
    document.getElementById('cursoNombreWelcome').textContent = curso.nombre;
    
    cargarDatosCompletos();
}

// ===== CARGAR TODOS LOS DATOS =====
async function cargarDatosCompletos() {
    try {
        await Promise.all([
            cargarHistorial(),
            cargarNotas(),
            cargarEvaluaciones()
        ]);
        
        // Si hay historial, iniciar sesión de aprendizaje
        if (historial.length > 0 && !sesionIniciada) {
            setTimeout(() => {
                iniciarSesionAprendizaje();
            }, 1000);
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// ===== VOLVER AL DASHBOARD =====
function volverDashboard() {
    localStorage.removeItem('cursoActual');
    window.location.href = 'dashboard.html';
}

// ===== CARGAR HISTORIAL (CON PERSISTENCIA) =====
async function cargarHistorial() {
    try {
        const response = await fetch(
            `${API_URL}/chat/historial?estudianteId=${usuario.id}&cursoId=${curso.id}`
        );
        
        if (response.ok) {
            historial = await response.json();
            
            if (historial && historial.length > 0) {
                const welcomeMsg = document.querySelector('.welcome-message');
                if (welcomeMsg) welcomeMsg.remove();
                
                historial.forEach(chat => {
                    agregarMensaje('user', chat.mensajeUsuario, new Date(chat.fecha));
                    agregarMensaje('ai', chat.respuestaIA, new Date(chat.fecha));
                });
                
                scrollToBottom();
            }
        }
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}

// ===== CARGAR NOTAS =====
async function cargarNotas() {
    // Cargar desde localStorage por ahora (en producción usar API)
    const notasGuardadas = localStorage.getItem(`notas_${curso.id}_${usuario.id}`);
    if (notasGuardadas) {
        conceptos = JSON.parse(notasGuardadas);
        renderizarConceptos();
    }
}

// ===== CARGAR EVALUACIONES =====
async function cargarEvaluaciones() {
    // Cargar desde localStorage por ahora (en producción usar API)
    const evaluacionesGuardadas = localStorage.getItem(`evaluaciones_${curso.id}_${usuario.id}`);
    if (evaluacionesGuardadas) {
        evaluaciones = JSON.parse(evaluacionesGuardadas);
        renderizarEvaluaciones();
    }
}

// ===== INICIAR SESIÓN DE APRENDIZAJE =====
async function iniciarSesionAprendizaje() {
    if (sesionIniciada) return;
    sesionIniciada = true;

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Primer saludo y pregunta inicial
    const saludo = `¡Hola de nuevo, ${usuario.nombre}! 👋
¿Cómo has estado desde la última vez que estudiaste ${curso.nombre}?`;

    agregarMensaje('ai', saludo, new Date());
    scrollToBottom();

    // Espera la respuesta del usuario
    esperarRespuestaUsuario(respuesta => {
        // Retroalimentación inicial
        const feedback = `¡Gracias por compartir! 😊 Me alegra saber cómo estás.
Vamos a repasar algunos conceptos de ${curso.nombre} y ver cómo has avanzado.`;

        agregarMensaje('ai', feedback, new Date());
        scrollToBottom();

        // Iniciar primera pregunta de evaluación automática
        setTimeout(() => {
            hacerPreguntaEvaluacion();
        }, 1000);
    });
}


// ===== LIMPIAR CHAT =====
function limpiarChat() {
    if (confirm('¿Estás seguro de que deseas limpiar el historial del chat? Las notas y evaluaciones se conservarán.')) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <h3>¡Hola! Soy tu tutor IA personal</h3>
                <p>Estoy aquí para ayudarte con <strong>${curso.nombre}</strong></p>
                <p class="welcome-subtitle">Puedes hacerme cualquier pregunta sobre el curso</p>
            </div>
        `;
        historial = [];
        sesionIniciada = false;
    }
}

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
    messageInput.addEventListener('input', () => {
        const length = messageInput.value.length;
        charCount.textContent = length;
        
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
        
        sendButton.disabled = length === 0;
    });
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
    
    chatForm.addEventListener('submit', enviarMensaje);
}

// ===== ENVIAR MENSAJE =====
async function enviarMensaje(e) {
    e.preventDefault();
    
    const mensaje = messageInput.value.trim();
    if (!mensaje) return;
    
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.remove();
    
    agregarMensaje('user', mensaje, new Date());
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
    charCount.textContent = '0';
    sendButton.disabled = true;
    
    typingIndicator.style.display = 'flex';
    scrollToBottom();
    
    try {
        const requestData = {
            curso: {
                id: curso.id,
                nombre: curso.nombre,
                descripcion: curso.descripcion || ''
            },
            historial: historial.map(h => ({
                mensajeUsuario: h.mensajeUsuario,
                respuestaIA: h.respuestaIA,
                fecha: h.fecha
            })),
            mensaje: mensaje,
            estudianteId: usuario.id,
            cursoId: curso.id,
            incluirEvaluacion: true // Nuevo parámetro
        };
        
        const response = await fetch(`${API_URL}/chat/mensaje`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        typingIndicator.style.display = 'none';
        
        if (response.ok) {
            const respuestaIA = await response.text();
            
            agregarMensaje('ai', respuestaIA, new Date());
            
            historial.push({
                mensajeUsuario: mensaje,
                respuestaIA: respuestaIA,
                fecha: new Date().toISOString()
            });
            
            // Extraer conceptos y evaluaciones de la respuesta
            extraerConceptos(respuestaIA);
            detectarEvaluacion(mensaje, respuestaIA);
            
            scrollToBottom();
        } else {
            agregarMensaje('ai', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.', new Date());
        }
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.style.display = 'none';
        agregarMensaje('ai', 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.', new Date());
    }
}

// ===== EXTRAER CONCEPTOS DE LA RESPUESTA =====
function extraerConceptos(respuesta) {
    // Detectar conceptos clave (palabras entre ** o definiciones)
    const patronConcepto = /\*\*([^*]+)\*\*:?\s*([^.\n]+)/g;
    let match;
    
    while ((match = patronConcepto.exec(respuesta)) !== null) {
        const titulo = match[1].trim();
        const descripcion = match[2].trim();
        
        // Evitar duplicados
        if (!conceptos.some(c => c.titulo === titulo)) {
            const concepto = {
                id: Date.now() + Math.random(),
                titulo: titulo,
                descripcion: descripcion,
                fecha: new Date().toISOString()
            };
            
            conceptos.push(concepto);
            guardarNotas();
            renderizarConceptos();
        }
    }
}

// ===== DETECTAR Y GUARDAR EVALUACIÓN =====
function detectarEvaluacion(pregunta, respuesta) {
    // Detectar si la respuesta contiene evaluación
    const esEvaluacion = respuesta.toLowerCase().includes('correcto') || 
                        respuesta.toLowerCase().includes('exacto') ||
                        respuesta.toLowerCase().includes('bien') ||
                        respuesta.toLowerCase().includes('incorrecto') ||
                        respuesta.toLowerCase().includes('no es correcto');
    
    if (esEvaluacion) {
        const esCorrecto = !respuesta.toLowerCase().includes('incorrecto') && 
                            !respuesta.toLowerCase().includes('no es correcto');
        
        const evaluacion = {
            id: Date.now(),
            pregunta: pregunta,
            respuesta: respuesta.substring(0, 200) + '...',
            correcta: esCorrecto,
            fecha: new Date().toISOString()
        };
        
        evaluaciones.push(evaluacion);
        guardarEvaluaciones();
        renderizarEvaluaciones();
    }
}

// ===== GUARDAR NOTAS EN LOCALSTORAGE =====
function guardarNotas() {
    localStorage.setItem(`notas_${curso.id}_${usuario.id}`, JSON.stringify(conceptos));
}

// ===== GUARDAR EVALUACIONES EN LOCALSTORAGE =====
function guardarEvaluaciones() {
    localStorage.setItem(`evaluaciones_${curso.id}_${usuario.id}`, JSON.stringify(evaluaciones));
}

// ===== RENDERIZAR CONCEPTOS =====
function renderizarConceptos() {
    const lista = document.getElementById('conceptosList');
    document.getElementById('conceptosCount').textContent = conceptos.length;
    
    if (conceptos.length === 0) {
        lista.innerHTML = `
            <div class="empty-notes">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>Aún no hay conceptos guardados</p>
                <small>Los conceptos importantes se guardarán automáticamente aquí</small>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = conceptos.slice().reverse().map(c => `
        <div class="note-card">
            <h4>📌 ${c.titulo}</h4>
            <p>${c.descripcion}</p>
            <div class="note-time">${formatearHora(new Date(c.fecha))}</div>
        </div>
    `).join('');
}

// ===== RENDERIZAR EVALUACIONES =====
function renderizarEvaluaciones() {
    const lista = document.getElementById('evaluacionesList');
    document.getElementById('evaluacionesCount').textContent = evaluaciones.length;
    
    if (evaluaciones.length === 0) {
        lista.innerHTML = `
            <div class="empty-notes">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <p>Aún no hay evaluaciones</p>
                <small>Tu progreso y evaluaciones aparecerán aquí</small>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = evaluaciones.slice().reverse().map(e => `
        <div class="evaluation-card">
            <div class="evaluation-header">
                <h4>❓ Evaluación</h4>
                <span class="evaluation-score ${e.correcta ? 'good' : 'bad'}">
                    ${e.correcta ? '✓ Correcto' : '✗ Revisar'}
                </span>
            </div>
            <p><strong>Tu respuesta:</strong> ${e.pregunta}</p>
            <p><strong>Retroalimentación:</strong> ${e.respuesta}</p>
            <div class="note-time">${formatearHora(new Date(e.fecha))}</div>
        </div>
    `).join('');
}

// ===== TOGGLE PANEL DE NOTAS =====
function toggleNotes() {
    notesPanel.classList.toggle('active');
}

// ===== SETUP NOTE TABS =====
function setupNoteTabs() {
    document.querySelectorAll('.note-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            document.querySelectorAll('.note-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.note-section').forEach(s => s.classList.remove('active'));
            document.getElementById(tabName + 'Section').classList.add('active');
        });
    });
}

// ===== AGREGAR MENSAJE AL CHAT =====
function agregarMensaje(tipo, texto, fecha) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${tipo}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (tipo === 'ai') {
        avatar.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
        `;
    } else {
        avatar.textContent = usuario.nombre.charAt(0).toUpperCase();
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = formatearTexto(texto);
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = formatearHora(fecha);
    
    content.appendChild(bubble);
    content.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
}

// ===== FORMATEAR TEXTO =====
function formatearTexto(texto) {
    texto = texto.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    texto = texto.replace(/`([^`]+)`/g, '<code>$1</code>');
    texto = texto.replace(/\n/g, '<br>');
    texto = texto.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    texto = texto.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return texto;
}

// ===== FORMATEAR HORA =====
function formatearHora(fecha) {
    const now = new Date();
    const diff = now - fecha;
    
    if (diff < 86400000) {
        return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    if (diff < 172800000) {
        return 'Ayer ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===== SCROLL AL FINAL =====
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function esperarRespuestaUsuario(callback) {
    // Listener temporal solo para la siguiente respuesta
    const handler = async (e) => {
        e.preventDefault();
        const mensaje = messageInput.value.trim();
        if (!mensaje) return;

        agregarMensaje('user', mensaje, new Date());

        messageInput.value = '';
        messageInput.style.height = 'auto';
        charCount.textContent = '0';
        sendButton.disabled = true;

        scrollToBottom();

        // Remover listener temporal
        chatForm.removeEventListener('submit', handler);

        // Callback con la respuesta
        callback(mensaje);
    };

    chatForm.addEventListener('submit', handler);
}

function hacerPreguntaEvaluacion() {
    if (conceptos.length === 0) {
        agregarMensaje('ai', 'Aún no tenemos conceptos guardados, pero podemos seguir estudiando.', new Date());
        return;
    }

    // Selecciona un concepto aleatorio
    const concepto = conceptos[Math.floor(Math.random() * conceptos.length)];

    const pregunta = `🔹 Recordemos el concepto de **${concepto.titulo}**:
    ¿Podrías explicarlo con tus propias palabras?`;

    agregarMensaje('ai', pregunta, new Date());
    scrollToBottom();

    // Esperar respuesta del usuario
    esperarRespuestaUsuario(respuesta => {
        // Retroalimentación automática básica
        const contienePalabrasClave = concepto.descripcion
            .split(' ')
            .some(palabra => respuesta.toLowerCase().includes(palabra.toLowerCase()));

        const feedback = contienePalabrasClave
            ? `¡Excelente! 😃 Has comprendido correctamente **${concepto.titulo}**.`
            : `No te preocupes, intenta repasar **${concepto.titulo}** nuevamente. Aquí está un resumen: ${concepto.descripcion}`;

        agregarMensaje('ai', feedback, new Date());
        scrollToBottom();

        // Guardar evaluación
        evaluaciones.push({
            id: Date.now(),
            pregunta: pregunta,
            respuesta: respuesta,
            correcta: contienePalabrasClave,
            fecha: new Date().toISOString()
        });
        guardarEvaluaciones();
        renderizarEvaluaciones();

        // Preguntar otro concepto después de un tiempo
        setTimeout(() => {
            hacerPreguntaEvaluacion();
        }, 1500);
    });
}
