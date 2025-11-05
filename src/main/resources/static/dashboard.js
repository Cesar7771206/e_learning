const API_URL = 'http://localhost:8080/api';
let usuario = null;
let misCursos = [];
let todosCursos = [];
let tutorSeleccionado = null;
let tutorias = []; // Array global para almacenar las tutorías reservadas


// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupMenuListeners();
    setupTutoriaFormListener();
});

// ===== AUTENTICACIÓN =====
function checkAuth() {
    const u = localStorage.getItem('usuario');
    if (!u) {
        window.location.href = 'index.html';
        return;
    }
    usuario = JSON.parse(u);
    document.getElementById('userName').textContent = usuario.nombre;
    
    if (usuario.rol === 'ESTUDIANTE') {
        document.getElementById('tutoresMenu').style.display = 'block';
    }
    
    cargarCursos();
}

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

// ===== MENÚ LATERAL =====
function setupMenuListeners() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            // Actualizar menu activo
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar sección
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section + 'Section').classList.add('active');
            
            // Cargar datos según la sección
            if (section === 'cursos') {
                cargarCursos();
            } else if (section === 'todosCursos') {
                cargarTodosCursos();
            } else if (section === 'tutorias') {
                cargarTutorias();
            } else if (section === 'tutores') {
                cargarTutores();
            }
        });
    });
}

// ===== CARGAR MIS CURSOS =====
async function cargarCursos() {
    const container = document.getElementById('cursosContainer');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_URL}/estudiantes/${usuario.id}/cursos`);
        
        if (!response.ok) throw new Error('Error al cargar cursos');
        
        misCursos = await response.json();
        
        if (!misCursos || misCursos.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>📚 No tienes cursos aún</h3>
                    <p>Explora y únete a nuevos cursos en la sección "Todos los Cursos"</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = misCursos.map(curso => `
            <div class="course-card">
                <div class="course-icon">📖</div>
                <h3>${curso.nombre || 'Sin nombre'}</h3>
                <p>${curso.descripcion || 'Sin descripción'}</p>
                <span class="course-nivel nivel-${curso.nivel || 'PRINCIPIANTE'}">${curso.nivel || 'PRINCIPIANTE'}</span>
                <button class="btn-ir-curso" onclick="entrarCurso(${curso.id}, '${curso.nombre.replace(/'/g, "\\'")}')">
                    Entrar al Curso
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>⚠️ Error al cargar cursos</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ===== CARGAR TODOS LOS CURSOS =====
async function cargarTodosCursos() {
    const container = document.getElementById('todosCursosContainer');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_URL}/cursos`);
        
        if (!response.ok) throw new Error('Error al cargar cursos');
        
        todosCursos = await response.json();
        
        if (!todosCursos || todosCursos.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>📚 No hay cursos disponibles</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = todosCursos.map(curso => {
            const estaInscrito = misCursos.some(c => c.id === curso.id);
            return `
                <div class="course-card">
                    <div class="course-icon">📖</div>
                    <h3>${curso.nombre || 'Sin nombre'}</h3>
                    <p>${curso.descripcion || 'Sin descripción'}</p>
                    <span class="course-nivel nivel-${curso.nivel || 'PRINCIPIANTE'}">${curso.nivel || 'PRINCIPIANTE'}</span>
                    ${estaInscrito 
                        ? `<button class="btn-ir-curso" onclick="entrarCurso(${curso.id}, '${curso.nombre.replace(/'/g, "\\'")}')">Entrar</button>`
                        : `<button class="btn-inscribir" onclick="inscribirse(${curso.id})">Inscribirme</button>`
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>⚠️ Error al cargar cursos</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ===== INSCRIBIRSE A CURSO =====
async function inscribirse(cursoId) {
    try {
        const response = await fetch(
            `${API_URL}/estudiantes/${usuario.id}/inscribir/${cursoId}`,
            { method: 'POST' }
        );
        
        if (response.ok) {
            alert('✅ ¡Inscripción exitosa!');
            cargarTodosCursos();
            cargarCursos();
        } else {
            const error = await response.text();
            alert('❌ Error: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al inscribirse');
    }
}

// ===== ENTRAR A CURSO (CHAT IA) =====
window.entrarCurso = function(cursoId, cursoNombre) {
    localStorage.setItem('cursoActual', JSON.stringify({
        id: cursoId,
        nombre: cursoNombre
    }));
    window.location.href = 'chat.html';
};

// ===== CARGAR TUTORÍAS =====
async function cargarTutorias() {
    const container = document.getElementById('tutoriasContainer');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_URL}/tutorias/estudiante/${usuario.id}`);
        
        if (!response.ok) throw new Error('Error al cargar tutorías');
        
        const tutorias = await response.json();
        
        if (!tutorias || tutorias.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>🗓️ Sin tutorías programadas</h3>
                    <p>Reserva una tutoría con un tutor para obtener ayuda personalizada</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tutorias.map(tut => `
            <div class="tutoria-card">
                <div class="tutoria-info">
                    <h4>${tut.tutor?.nombre || 'Tutor'}</h4>
                    <p><strong>Curso:</strong> ${tut.curso?.nombre || 'N/A'}</p>
                    <p><strong>Fecha:</strong> ${new Date(tut.fecha).toLocaleString('es-ES')}</p>
                    ${tut.enlaceReunion ? `<p><strong>Enlace:</strong> <a href="${tut.enlaceReunion}" target="_blank">${tut.enlaceReunion}</a></p>` : ''}
                </div>
                <span class="tutoria-estado estado-${tut.estado}">${tut.estado}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>⚠️ Error al cargar tutorías</h3>
            </div>
        `;
    }
}

// ===== CARGAR TUTORES =====
async function cargarTutores() {
    const container = document.getElementById('tutoresContainer');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_URL}/tutores`);
        
        if (!response.ok) throw new Error('Error al cargar tutores');
        
        const tutores = await response.json();
        
        if (!tutores || tutores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>👨‍🏫 No hay tutores disponibles</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tutores.map(tutor => `
            <div class="tutor-card">
                <div class="tutor-avatar">${tutor.nombre?.charAt(0).toUpperCase() || 'T'}</div>
                <h3>${tutor.nombre}</h3>
                <p class="especialidad">${tutor.especialidad}</p>
                <p class="descripcion">${tutor.descripcion}</p>
                <button class="btn-reservar" onclick="abrirModalTutoria(${tutor.id}, '${tutor.nombre.replace(/'/g, "\\'")}')"">
                    Reservar Tutoría
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>⚠️ Error al cargar tutores</h3>
            </div>
        `;
    }
}

// ===== MODAL DE TUTORÍA =====
function abrirModalTutoria(tutorId, tutorNombre) {
    tutorSeleccionado = tutorId;
    
    document.getElementById('tutorInfo').innerHTML = `
        <h3>${tutorNombre}</h3>
    `;
    
    // Llenar select de cursos
    const selectCursos = document.getElementById('tutoriaCurso');
    selectCursos.innerHTML = '<option value="">Selecciona un curso</option>';
    
    if (misCursos && misCursos.length > 0) {
        selectCursos.innerHTML += misCursos.map(curso => 
            `<option value="${curso.id}">${curso.nombre}</option>`
        ).join('');
    }
    
    document.getElementById('tutoriaModal').classList.add('show');
}

function cerrarModal() {
    document.getElementById('tutoriaModal').classList.remove('show');
    document.getElementById('tutoriaForm').reset();
    tutorSeleccionado = null;
}

// ===== ENVIAR FORMULARIO DE TUTORÍA =====
function setupTutoriaFormListener() {
    document.getElementById('tutoriaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cursoId = document.getElementById('tutoriaCurso').value;
        const fecha = document.getElementById('tutoriaFecha').value;
        
        if (!cursoId || !fecha) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        try {
            const response = await fetch(
                `${API_URL}/tutorias/reservar?idEstudiante=${usuario.id}&idTutor=${tutorSeleccionado}&fechaHora=${fecha}`,
                { method: 'POST' }
            );
            
            if (response.ok) {
                alert('✅ ¡Tutoría reservada exitosamente!');
                cerrarModal();
                cargarTutorias();
            } else {
                alert('❌ Error al reservar la tutoría');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al reservar la tutoría');
        }
    });
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', (e) => {
    const modal = document.getElementById('tutoriaModal');
    if (e.target === modal) {
        cerrarModal();
    }
});

// ===== DATOS DE TUTORES DE PRUEBA =====
const tutoresPrueba = [
    {
        id: 1,
        nombre: "Dra. María González",
        especialidad: "Matemáticas y Álgebra",
        descripcion: "Doctora en Matemáticas con 15 años de experiencia. Especializada en álgebra lineal y cálculo.",
        tarifa: 25.00,
        moneda: "USD",
        disponibilidad: ["Lunes 14:00-18:00", "Miércoles 14:00-18:00", "Viernes 14:00-18:00"],
        calificacion: 4.9,
        totalResenas: 127,
        cursosEspecialidad: ["Matemáticas", "Cálculo", "Álgebra"],
        imagen: "https://i.pravatar.cc/150?img=5"
    },
    {
        id: 2,
        nombre: "Ing. Carlos Rodríguez",
        especialidad: "Programación y Desarrollo Web",
        descripcion: "Ingeniero de Software con experiencia en desarrollo full-stack. Experto en JavaScript, Python y frameworks modernos.",
        tarifa: 30.00,
        moneda: "USD",
        disponibilidad: ["Martes 16:00-20:00", "Jueves 16:00-20:00", "Sábado 10:00-14:00"],
        calificacion: 4.8,
        totalResenas: 94,
        cursosEspecialidad: ["Programación", "JavaScript", "Python", "React"],
        imagen: "https://i.pravatar.cc/150?img=12"
    },
    {
        id: 3,
        nombre: "Prof. Ana Martínez",
        especialidad: "Física y Ciencias",
        descripcion: "Profesora de Física con maestría en Educación. Especializada en física cuántica y mecánica clásica.",
        tarifa: 22.00,
        moneda: "USD",
        disponibilidad: ["Lunes 10:00-14:00", "Miércoles 10:00-14:00", "Viernes 10:00-14:00"],
        calificacion: 4.7,
        totalResenas: 83,
        cursosEspecialidad: ["Física", "Química", "Ciencias"],
        imagen: "https://i.pravatar.cc/150?img=9"
    },
    {
        id: 4,
        nombre: "Lic. Roberto Silva",
        especialidad: "Inglés y Comunicación",
        descripcion: "Licenciado en Lenguas Extranjeras. Certificado TESOL con 10 años enseñando inglés.",
        tarifa: 20.00,
        moneda: "USD",
        disponibilidad: ["Martes 14:00-18:00", "Jueves 14:00-18:00", "Sábado 14:00-18:00"],
        calificacion: 4.9,
        totalResenas: 156,
        cursosEspecialidad: ["Inglés", "Gramática", "Conversación"],
        imagen: "https://i.pravatar.cc/150?img=33"
    },
    {
        id: 5,
        nombre: "MSc. Laura Fernández",
        especialidad: "Estadística y Data Science",
        descripcion: "Master en Ciencia de Datos. Especializada en análisis estadístico, machine learning y visualización de datos.",
        tarifa: 35.00,
        moneda: "USD",
        disponibilidad: ["Lunes 18:00-21:00", "Miércoles 18:00-21:00", "Domingo 10:00-13:00"],
        calificacion: 5.0,
        totalResenas: 68,
        cursosEspecialidad: ["Estadística", "Data Science", "Python", "R"],
        imagen: "https://i.pravatar.cc/150?img=10"
    },
    {
        id: 6,
        nombre: "Dr. Miguel Ángel Torres",
        especialidad: "Historia y Ciencias Sociales",
        descripcion: "Doctor en Historia con especialización en historia contemporánea. Apasionado por la enseñanza interactiva.",
        tarifa: 18.00,
        moneda: "USD",
        disponibilidad: ["Martes 10:00-14:00", "Jueves 10:00-14:00", "Viernes 15:00-19:00"],
        calificacion: 4.6,
        totalResenas: 72,
        cursosEspecialidad: ["Historia", "Geografía", "Ciencias Sociales"],
        imagen: "https://i.pravatar.cc/150?img=14"
    }
];

// ===== CARGAR TUTORES MEJORADO =====
async function cargarTutores() {
    const container = document.getElementById('tutoresContainer');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    try {
        // En producción, hacer fetch a la API
        // const response = await fetch(`${API_URL}/tutores`);
        // const tutores = await response.json();
        
        // Por ahora usar datos de prueba
        const tutores = tutoresPrueba;
        
        if (!tutores || tutores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>👨‍🏫 No hay tutores disponibles</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tutores.map(tutor => `
            <div class="tutor-card-enhanced">
                <div class="tutor-header">
                    <img src="${tutor.imagen}" alt="${tutor.nombre}" class="tutor-img">
                    <div class="tutor-rating">
                        <span class="rating-stars">${generarEstrellas(tutor.calificacion)}</span>
                        <span class="rating-number">${tutor.calificacion}</span>
                        <span class="rating-count">(${tutor.totalResenas})</span>
                    </div>
                </div>
                
                <div class="tutor-body">
                    <h3>${tutor.nombre}</h3>
                    <p class="especialidad">🎓 ${tutor.especialidad}</p>
                    <p class="descripcion">${tutor.descripcion}</p>
                    
                    <div class="tutor-cursos">
                        <strong>Cursos:</strong>
                        <div class="curso-tags">
                            ${tutor.cursosEspecialidad.slice(0, 3).map(c => 
                                `<span class="curso-tag">${c}</span>`
                            ).join('')}
                            ${tutor.cursosEspecialidad.length > 3 ? 
                                `<span class="curso-tag">+${tutor.cursosEspecialidad.length - 3}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="tutor-info-grid">
                        <div class="info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>${tutor.disponibilidad.length} horarios</span>
                        </div>
                        <div class="info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            <span class="tarifa">${tutor.tarifa} ${tutor.moneda}/hora</span>
                        </div>
                    </div>
                    
                    <div class="tutor-disponibilidad">
                        <strong>Disponibilidad:</strong>
                        <ul>
                            ${tutor.disponibilidad.slice(0, 2).map(d => 
                                `<li>📅 ${d}</li>`
                            ).join('')}
                        </ul>
                        ${tutor.disponibilidad.length > 2 ? 
                            `<small>+${tutor.disponibilidad.length - 2} horarios más</small>` : ''}
                    </div>
                </div>
                
                <div class="tutor-footer">
                    <button class="btn-ver-perfil" onclick="verPerfilTutor(${tutor.id})">
                        Ver Perfil Completo
                    </button>
                    <button class="btn-reservar-enhanced" onclick="abrirModalTutoria(${tutor.id}, '${tutor.nombre.replace(/'/g, "\\'")}', ${tutor.tarifa})">
                        Reservar Tutoría
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>⚠️ Error al cargar tutores</h3>
            </div>
        `;
    }
}

// ===== GENERAR ESTRELLAS DE CALIFICACIÓN =====
function generarEstrellas(calificacion) {
    const estrellas = Math.round(calificacion);
    let html = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= estrellas) {
            html += '⭐';
        } else {
            html += '☆';
        }
    }
    
    return html;
}

// ===== VER PERFIL COMPLETO DEL TUTOR =====
function verPerfilTutor(tutorId) {
    const tutor = tutoresPrueba.find(t => t.id === tutorId);
    
    if (!tutor) return;
    
    // Crear modal de perfil
    const modalHTML = `
        <div class="modal show" id="perfilTutorModal">
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Perfil del Tutor</h2>
                    <button class="btn-close" onclick="cerrarPerfilTutor()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="perfil-tutor-completo">
                        <div class="perfil-header">
                            <img src="${tutor.imagen}" alt="${tutor.nombre}" class="perfil-img">
                            <div class="perfil-info">
                                <h3>${tutor.nombre}</h3>
                                <p class="perfil-especialidad">🎓 ${tutor.especialidad}</p>
                                <div class="perfil-rating">
                                    ${generarEstrellas(tutor.calificacion)}
                                    <span>${tutor.calificacion}/5.0</span>
                                    <span>(${tutor.totalResenas} reseñas)</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="perfil-section">
                            <h4>📝 Sobre el tutor</h4>
                            <p>${tutor.descripcion}</p>
                        </div>
                        
                        <div class="perfil-section">
                            <h4>💵 Tarifa</h4>
                            <p class="tarifa-destacada">${tutor.tarifa} ${tutor.moneda} por hora</p>
                        </div>
                        
                        <div class="perfil-section">
                            <h4>📚 Cursos que imparte</h4>
                            <div class="curso-tags-large">
                                ${tutor.cursosEspecialidad.map(c => 
                                    `<span class="curso-tag-large">${c}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="perfil-section">
                            <h4>🕐 Disponibilidad</h4>
                            <ul class="disponibilidad-lista">
                                ${tutor.disponibilidad.map(d => 
                                    `<li>📅 ${d}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <button class="btn-primary" onclick="cerrarPerfilTutor(); abrirModalTutoria(${tutor.id}, '${tutor.nombre.replace(/'/g, "\\'")}', ${tutor.tarifa})">
                        Reservar Tutoría con ${tutor.nombre.split(' ')[0]}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function cerrarPerfilTutor() {
    const modal = document.getElementById('perfilTutorModal');
    if (modal) {
        modal.remove();
    }
}

// ===== MODAL DE TUTORÍA MEJORADO =====
function abrirModalTutoria(tutorId, tutorNombre, tarifa) {
    tutorSeleccionado = tutorId;
    
    const tutor = tutoresPrueba.find(t => t.id === tutorId);
    
    document.getElementById('tutorInfo').innerHTML = `
        <div class="tutor-modal-info">
            <img src="${tutor.imagen}" alt="${tutorNombre}" class="tutor-modal-img">
            <div>
                <h3>${tutorNombre}</h3>
                <p>${tutor.especialidad}</p>
                <p class="tarifa-modal">💵 ${tarifa} USD/hora</p>
            </div>
        </div>
    `;
    
    // Llenar select de cursos filtrando por especialidad del tutor
    const selectCursos = document.getElementById('tutoriaCurso');
    selectCursos.innerHTML = '<option value="">Selecciona un curso</option>';
    
    if (misCursos && misCursos.length > 0) {
        const cursosCompatibles = misCursos.filter(curso => 
            tutor.cursosEspecialidad.some(esp => 
                curso.nombre.toLowerCase().includes(esp.toLowerCase()) ||
                esp.toLowerCase().includes(curso.nombre.toLowerCase())
            )
        );
        
        if (cursosCompatibles.length > 0) {
            selectCursos.innerHTML += cursosCompatibles.map(curso => 
                `<option value="${curso.id}">${curso.nombre}</option>`
            ).join('');
        } else {
            selectCursos.innerHTML += misCursos.map(curso => 
                `<option value="${curso.id}">${curso.nombre}</option>`
            ).join('');
        }
    }
    
    document.getElementById('tutoriaModal').classList.add('show');
}

