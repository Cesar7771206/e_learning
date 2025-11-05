const API_URL = 'http://localhost:8080/api';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabs = document.querySelectorAll('.tab');
const registerRole = document.getElementById('registerRole');
const studentFields = document.getElementById('studentFields');
const tutorFields = document.getElementById('tutorFields');

// Verificar si ya hay sesión activa
if (localStorage.getItem('usuario')) {
    window.location.href = 'dashboard.html';
}

// Manejo de tabs
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.form-container').forEach(form => {
            form.classList.remove('active');
        });
        
        if (tabName === 'login') {
            loginForm.classList.add('active');
        } else {
            registerForm.classList.add('active');
        }
    });
});

// Mostrar campos según tipo de usuario
registerRole.addEventListener('change', (e) => {
    const role = e.target.value;
    studentFields.style.display = 'none';
    tutorFields.style.display = 'none';
    
    if (role === 'ESTUDIANTE') {
        studentFields.style.display = 'block';
    } else if (role === 'TUTOR') {
        tutorFields.style.display = 'block';
    }
});

// FORMULARIO DE LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = loginForm.querySelector('.btn-primary');
    const btnText = btn.querySelector('span');
    const spinner = btn.querySelector('.spinner');
    
    if (!email || !password) {
        showAlert('loginAlert', 'error', 'Por favor completa todos los campos');
        return;
    }
    
    btn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
        const response = await fetch(`${API_URL}/usuarios/login?correo=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const usuario = await response.json();
            
            if (usuario && usuario.id) {
                localStorage.setItem('usuario', JSON.stringify(usuario));
                showAlert('loginAlert', 'success', '¡Bienvenido! Redirigiendo...');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showAlert('loginAlert', 'error', 'Credenciales incorrectas');
            }
        } else {
            showAlert('loginAlert', 'error', 'Error al iniciar sesión. Verifica tus credenciales.');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('loginAlert', 'error', 'Error de conexión. Intenta nuevamente.');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        spinner.style.display = 'none';
    }
});

// FORMULARIO DE REGISTRO
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const rol = document.getElementById('registerRole').value;
    const btn = registerForm.querySelector('.btn-primary');
    const btnText = btn.querySelector('span');
    const spinner = btn.querySelector('.spinner');
    
    if (!nombre || !email || !password || !rol) {
        showAlert('registerAlert', 'error', 'Por favor completa todos los campos obligatorios');
        return;
    }
    
    if (password.length < 6) {
        showAlert('registerAlert', 'error', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    btn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
        const params = new URLSearchParams();
        params.append('nombre', nombre);
        params.append('correo', email);
        params.append('password', password);
        params.append('rol', rol);
        
        let url = `${API_URL}/usuarios/registro?${params.toString()}`;
        
        // Si es tutor, usar el endpoint especifico de tutores
        if (rol === 'TUTOR') {
            const especialidad = document.getElementById('especialidad').value.trim();
            const descripcion = document.getElementById('descripcion').value.trim();
            
            if (!especialidad || !descripcion) {
                showAlert('registerAlert', 'error', 'Por favor completa especialidad y descripción');
                btn.disabled = false;
                btnText.style.display = 'block';
                spinner.style.display = 'none';
                return;
            }
            
            const tutorParams = new URLSearchParams();
            tutorParams.append('nombre', nombre);
            tutorParams.append('correo', email);
            tutorParams.append('password', password);
            tutorParams.append('especialidad', especialidad);
            tutorParams.append('descripcion', descripcion);
            
            url = `${API_URL}/tutores/registro?${tutorParams.toString()}`;
        }
        
        const response = await fetch(url, { method: 'POST' });
        
        if (response.ok) {
            showAlert('registerAlert', 'success', '¡Registro exitoso! Redirigiendo al login...');
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
                registerForm.reset();
                studentFields.style.display = 'none';
                tutorFields.style.display = 'none';
            }, 2000);
        } else {
            const error = await response.text();
            showAlert('registerAlert', 'error', 'Error en el registro: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('registerAlert', 'error', 'Error de conexión. Intenta nuevamente.');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        spinner.style.display = 'none';
    }
});

// Función para mostrar alertas
function showAlert(alertId, type, message) {
    const alert = document.getElementById(alertId);
    alert.className = `alert ${type}`;
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}