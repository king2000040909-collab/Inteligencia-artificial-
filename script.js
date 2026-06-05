/* ==========================================
   SCRIPT PRINCIPAL - FUNCIONALIDAD DINÁMICA
   ========================================== */

// Datos del repositorio
const repoData = {
    name: 'Inteligencia-artificial-',
    owner: 'king2000040909-collab',
    description: 'IA aplicada a la educación 25-26',
    branch: 'main',
    url: 'https://github.com/king2000040909-collab/Inteligencia-artificial-',
    stats: {
        stars: 0,
        forks: 0,
        watchers: 0,
        issues: 0
    },
    repoId: '1260448809'
};

// ==========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeRepo();
    setupScrollAnimations();
    setupEventListeners();
});

// ==========================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ==========================================

function initializeRepo() {
    console.log('🚀 Inicializando repositorio de IA en Educación...');
    
    // Actualizar datos en la página
    updateRepoInfo();
    updateStatistics();
    updateLanguages();
    
    // Animaciones
    animateOnScroll();
    
    console.log('✅ Repositorio inicializado correctamente');
}

// ==========================================
// ACTUALIZAR INFORMACIÓN DEL REPOSITORIO
// ==========================================

function updateRepoInfo() {
    // Actualizar nombre
    const repoNameElement = document.getElementById('repo-name');
    if (repoNameElement) {
        repoNameElement.textContent = repoData.name;
    }

    // Actualizar propietario
    const repoOwnerElement = document.getElementById('repo-owner');
    if (repoOwnerElement) {
        repoOwnerElement.innerHTML = `
            <a href="https://github.com/${repoData.owner}" target="_blank">
                ${repoData.owner}
            </a>
        `;
    }

    // Actualizar descripción
    const repoDescElement = document.getElementById('repo-description');
    if (repoDescElement) {
        repoDescElement.textContent = repoData.description;
    }

    // Actualizar rama
    const repoBranchElement = document.getElementById('repo-branch');
    if (repoBranchElement) {
        repoBranchElement.textContent = repoData.branch;
    }

    // Actualizar fecha
    const repoUpdatedElement = document.getElementById('repo-updated');
    if (repoUpdatedElement) {
        const today = new Date();
        repoUpdatedElement.textContent = today.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Actualizar ID
    const repoIdElement = document.getElementById('repo-id');
    if (repoIdElement) {
        repoIdElement.textContent = repoData.repoId;
    }
}

// ==========================================
// ACTUALIZAR ESTADÍSTICAS
// ==========================================

function updateStatistics() {
    // Simular obtención de datos (en producción sería una API call)
    const stats = repoData.stats;

    // Stars
    const starsElement = document.getElementById('stat-stars');
    if (starsElement) {
        animateNumber(starsElement, stats.stars, 0);
    }

    // Forks
    const forksElement = document.getElementById('stat-forks');
    if (forksElement) {
        animateNumber(forksElement, stats.forks, 0);
    }

    // Watchers
    const watchersElement = document.getElementById('stat-watchers');
    if (watchersElement) {
        animateNumber(watchersElement, stats.watchers, 0);
    }

    // Issues
    const issuesElement = document.getElementById('stat-issues');
    if (issuesElement) {
        animateNumber(issuesElement, stats.issues, 0);
    }
}

// ==========================================
// ACTUALIZAR LENGUAJES DE PROGRAMACIÓN
// ==========================================

function updateLanguages() {
    const container = document.getElementById('languages-container');
    
    if (!container) return;

    // Simular lenguajes detectados
    const languages = [
        { name: 'Python', percentage: 45 },
        { name: 'JavaScript', percentage: 25 },
        { name: 'HTML/CSS', percentage: 15 },
        { name: 'Otros', percentage: 15 }
    ];

    // Limpiar contenedor
    container.innerHTML = '';

    // Agregar cada lenguaje
    languages.forEach(lang => {
        const languageItem = document.createElement('div');
        languageItem.className = 'language-item';
        languageItem.innerHTML = `
            <span class="language-name">${lang.name}</span>
            <span class="language-percent">${lang.percentage}%</span>
        `;
        container.appendChild(languageItem);
    });

    // Agregar animación de carga
    const items = container.querySelectorAll('.language-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s forwards`;
    });
}

// ==========================================
// ANIMACIÓN DE NÚMEROS
// ==========================================

function animateNumber(element, target, current) {
    const increment = target / 60;
    
    const counter = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// ==========================================
// SCROLL SUAVE ENTRE SECCIONES
// ==========================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Botones de navegación
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
            }
        });
    });

    // Botón CTA
    const ctaButton = document.querySelector('.btn-primary');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            scrollToSection('repo-info');
        });
    }
}

// ==========================================
// ANIMACIONES AL SCROLL
// ==========================================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar todos los elementos animables
    const animatableElements = document.querySelectorAll(
        '.stat-card, .feature-card, .file-item, .timeline-item'
    );
    
    animatableElements.forEach(element => {
        observer.observe(element);
    });
}

function animateOnScroll() {
    // Implementar Intersection Observer para animaciones
    if ('IntersectionObserver' in window) {
        setupScrollAnimations();
    }
}

// ==========================================
// INFORMACIÓN DEL SISTEMA
// ==========================================

function logSystemInfo() {
    console.log('%c🤖 Página de IA en Educación', 'color: #6366f1; font-size: 20px; font-weight: bold;');
    console.log('%cRepositorio:', 'color: #8b5cf6; font-weight: bold;', repoData.name);
    console.log('%cPropietario:', 'color: #8b5cf6; font-weight: bold;', repoData.owner);
    console.log('%cDescripción:', 'color: #8b5cf6; font-weight: bold;', repoData.description);
    console.log('%c📊 Estadísticas:', 'color: #ec4899; font-weight: bold;', repoData.stats);
}

// Ejecutar al cargar
logSystemInfo();

// ==========================================
// FUNCIONES UTILITARIAS
// ==========================================

// Obtener fecha formateada
function getFormattedDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(date).toLocaleDateString('es-ES', options);
}

// Formatear números grandes
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('✅ Copiado al portapapeles:', text);
        showNotification('Copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

// Notificación simple
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #6366f1;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==========================================
// MODO OSCURO (FUTURO)
// ==========================================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Verificar preferencia guardada
function checkDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// ==========================================
// API SIMULADA PARA DATOS DEL REPOSITORIO
// ==========================================

async function fetchRepoData() {
    try {
        // En producción, esto sería un call real a la API de GitHub
        console.log('📡 Obteniendo datos del repositorio...');
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Datos obtenidos correctamente');
        return repoData;
    } catch (error) {
        console.error('❌ Error al obtener datos:', error);
        return null;
    }
}

// ==========================================
// CONTROL DE VERSIONES
// ==========================================

const VERSION = '1.0.0';
const LAST_UPDATE = new Date().toLocaleDateString('es-ES');

function getVersionInfo() {
    return {
        version: VERSION,
        lastUpdate: LAST_UPDATE,
        project: 'IA en Educación 2025-2026'
    };
}

console.log('📦 Versión:', getVersionInfo());

// ==========================================
// FUNCIONES DE DESARROLLO
// ==========================================

// Debug: Mostrar todos los datos en consola
function debugMode() {
    console.log('%c🔧 MODO DEBUG ACTIVADO', 'background: #ff6b6b; color: white; font-weight: bold; padding: 10px;');
    console.log('Datos del repositorio:', repoData);
    console.log('Versión:', getVersionInfo());
    console.log('Elementos en la página:', {
        cards: document.querySelectorAll('.stat-card').length,
        features: document.querySelectorAll('.feature-card').length,
        files: document.querySelectorAll('.file-item').length
    });
}

// Ejecutar: window.debugMode() en la consola

// ==========================================
// EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.repoApp = {
    debugMode,
    scrollToSection,
    copyToClipboard,
    showNotification,
    toggleDarkMode,
    getVersionInfo,
    fetchRepoData
};

console.log('%c✅ Aplicación cargada correctamente', 'color: #10b981; font-weight: bold; font-size: 14px;');
console.log('💡 Tip: Usa window.repoApp para acceder a funciones globales');
