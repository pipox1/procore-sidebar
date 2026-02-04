/* ========================================
   PROCORE SIDEBAR - JAVASCRIPT
   ======================================== */

// Configuración de la aplicación
const APP_CONFIG = {
    baseUrl: '',
    projectId: null,
    companyId: null,
    projectName: ''
};

// Lista de todas las herramientas con sus propiedades
const ALL_TOOLS = [
    { id: 'home', name: 'Home', icon: 'fa-home', path: '/home', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'documents', name: 'Documents', icon: 'fa-folder-open', path: '/documents', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'directory', name: 'Directory', icon: 'fa-address-book', path: '/directory', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'rfis', name: 'RFIs', icon: 'fa-question-circle', path: '/rfis', color: 'linear-gradient(135deg, #F47E42 0%, #ff6b6b 100%)' },
    { id: 'submittals', name: 'Submittals', icon: 'fa-file-import', path: '/submittals', color: 'linear-gradient(135deg, #0076D6 0%, #00c6fb 100%)' },
    { id: 'daily-log', name: 'Daily Log', icon: 'fa-clipboard-list', path: '/daily_log', color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'photos', name: 'Photos', icon: 'fa-camera', path: '/photos', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { id: 'drawings', name: 'Drawings', icon: 'fa-drafting-compass', path: '/drawings', color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { id: 'punch-list', name: 'Punch List', icon: 'fa-list-check', path: '/punch_list', color: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'schedule', name: 'Schedule', icon: 'fa-calendar-alt', path: '/schedule', color: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)' },
    { id: 'inspections', name: 'Inspections', icon: 'fa-clipboard-check', path: '/inspections', color: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)' },
    { id: 'forms', name: 'Forms', icon: 'fa-file-lines', path: '/forms', color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    { id: 'observations', name: 'Observations', icon: 'fa-eye', path: '/observations', color: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)' },
    { id: 'incidents', name: 'Incidents', icon: 'fa-exclamation-triangle', path: '/incidents', color: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)' },
    { id: 'meetings', name: 'Meetings', icon: 'fa-users', path: '/meetings', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { id: 'budget', name: 'Budget', icon: 'fa-calculator', path: '/budgets', color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' }
];

// Favoritos por defecto
let userFavorites = ['rfis', 'submittals', 'punch-list', 'daily-log', 'photos', 'drawings', 'schedule', 'forms'];

// Tema actual
let isDarkTheme = false;

/* ========================================
   INICIALIZACIÓN
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadUserPreferences();
    renderFavorites();
    setupCollapsibleSections();
});

function initializeApp() {
    // Intentar obtener contexto de Procore
    if (window.parent !== window) {
        // Estamos en un iframe, intentar comunicación con Procore
        window.addEventListener('message', handleProcoreMessage);
        
        // Solicitar contexto
        window.parent.postMessage({ type: 'REQUEST_CONTEXT' }, '*');
    }
    
    // Verificar si hay Procore SDK disponible
    if (typeof Procore !== 'undefined' && Procore.Context) {
        Procore.Context.get().then(context => {
            APP_CONFIG.projectId = context.project_id;
            APP_CONFIG.companyId = context.company_id;
            APP_CONFIG.projectName = context.project_name || 'Proyecto';
            APP_CONFIG.baseUrl = `https://app.procore.com/${context.company_id}/company/projects/${context.project_id}`;
            
            document.getElementById('projectName').textContent = APP_CONFIG.projectName;
            updateToolLinks();
        }).catch(err => {
            console.log('Contexto de Procore no disponible:', err);
            setDemoMode();
        });
    } else {
        setDemoMode();
    }
}

function setDemoMode() {
    document.getElementById('projectName').textContent = 'HBS Pump´s kit (20 N...)';
    // Simular contadores
    setTimeout(() => {
        updateBadge('rfiBadge', 3);
        updateBadge('submittalBadge', 5);
        updateBadge('punchBadge', 12);
        updateBadge('obsBadge', 2);
    }, 500);
}

function handleProcoreMessage(event) {
    if (event.data && event.data.type === 'PROCORE_CONTEXT') {
        APP_CONFIG.projectId = event.data.projectId;
        APP_CONFIG.companyId = event.data.companyId;
        APP_CONFIG.projectName = event.data.projectName;
        document.getElementById('projectName').textContent = APP_CONFIG.projectName;
    }
}

/* ========================================
   EVENT LISTENERS
   ======================================== */
function setupEventListeners() {
    // Búsqueda
    document.getElementById('searchTools').addEventListener('input', (e) => {
        filterTools(e.target.value);
    });

    // Clicks en herramientas
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', (e) => handleToolClick(e, item));
    });

    // Botón actualizar
    document.getElementById('btnRefresh').addEventListener('click', () => {
        refreshData();
    });

    // Botón tema
    document.getElementById('btnTheme').addEventListener('click', () => {
        toggleTheme();
    });

    // Editar favoritos
    document.getElementById('btnEditFavorites').addEventListener('click', () => {
        openFavoritesModal();
    });

    // Modal - Cerrar
    document.getElementById('closeFavorites').addEventListener('click', () => {
        closeFavoritesModal();
    });

    document.getElementById('cancelFavorites').addEventListener('click', () => {
        closeFavoritesModal();
    });

    // Modal - Guardar
    document.getElementById('saveFavorites').addEventListener('click', () => {
        saveFavorites();
    });

    // Click fuera del modal
    document.getElementById('favoritesModal').addEventListener('click', (e) => {
        if (e.target.id === 'favoritesModal') {
            closeFavoritesModal();
        }
    });
}

/* ========================================
   SECCIONES COLAPSABLES
   ======================================== */
function setupCollapsibleSections() {
    document.querySelectorAll('.section-header.collapsible').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.dataset.section;
            const toolsList = header.nextElementSibling;
            
            header.classList.toggle('collapsed');
            toolsList.classList.toggle('collapsed');
            
            // Guardar estado
            saveCollapsedState(section, header.classList.contains('collapsed'));
        });
    });
    
    // Restaurar estado guardado
    loadCollapsedStates();
}

function saveCollapsedState(section, isCollapsed) {
    const states = JSON.parse(localStorage.getItem('procore_collapsed_sections') || '{}');
    states[section] = isCollapsed;
    localStorage.setItem('procore_collapsed_sections', JSON.stringify(states));
}

function loadCollapsedStates() {
    const states = JSON.parse(localStorage.getItem('procore_collapsed_sections') || '{}');
    Object.entries(states).forEach(([section, isCollapsed]) => {
        if (isCollapsed) {
            const header = document.querySelector(`[data-section="${section}"]`);
            if (header) {
                header.classList.add('collapsed');
                header.nextElementSibling.classList.add('collapsed');
            }
        }
    });
}

/* ========================================
   BÚSQUEDA
   ======================================== */
function filterTools(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    document.querySelectorAll('.tool-item').forEach(item => {
        const toolName = item.querySelector('span').textContent.toLowerCase();
        if (toolName.includes(normalizedQuery) || normalizedQuery === '') {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Expandir todas las secciones si hay búsqueda
    if (normalizedQuery) {
        document.querySelectorAll('.tools-list').forEach(list => {
            list.classList.remove('collapsed');
        });
        document.querySelectorAll('.section-header.collapsible').forEach(header => {
            header.classList.remove('collapsed');
        });
    }
}

/* ========================================
   NAVEGACIÓN
   ======================================== */
function handleToolClick(e, item) {
    e.preventDefault();
    
    const path = item.dataset.path;
    const toolName = item.querySelector('span').textContent;
    
    // Remover clase active de todos
    document.querySelectorAll('.tool-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.favorite-item').forEach(i => i.classList.remove('active'));
    
    // Agregar clase active
    item.classList.add('active');
    
    // Navegar
    navigateToTool(path, toolName);
}

function navigateToTool(path, toolName) {
    // Intentar usar Procore SDK
    if (typeof Procore !== 'undefined' && Procore.Navigation) {
        Procore.Navigation.navigate(path);
        return;
    }
    
    // Intentar postMessage al padre
    if (window.parent !== window) {
        window.parent.postMessage({
            type: 'NAVIGATE',
            path: path,
            toolName: toolName
        }, '*');
    }
    
    // Si tenemos URL base, construir URL completa
    if (APP_CONFIG.baseUrl) {
        const fullUrl = APP_CONFIG.baseUrl + path;
        window.parent.location.href = fullUrl;
    }
    
    showToast(`Navegando a ${toolName}`);
}

function updateToolLinks() {
    document.querySelectorAll('.tool-item').forEach(item => {
        const path = item.dataset.path;
        if (APP_CONFIG.baseUrl) {
            item.href = APP_CONFIG.baseUrl + path;
        }
    });
}

/* ========================================
   FAVORITOS
   ======================================== */
function loadUserPreferences() {
    // Cargar favoritos
    const savedFavorites = localStorage.getItem('procore_sidebar_favorites');
    if (savedFavorites) {
        userFavorites = JSON.parse(savedFavorites);
    }
    
    // Cargar tema
    const savedTheme = localStorage.getItem('procore_sidebar_theme');
    if (savedTheme === 'dark') {
        isDarkTheme = true;
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }
}

function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '';
    
    userFavorites.slice(0, 8).forEach(favId => {
        const tool = ALL_TOOLS.find(t => t.id === favId);
        if (tool) {
            const favItem = document.createElement('div');
            favItem.className = 'favorite-item';
            favItem.dataset.path = tool.path;
            favItem.innerHTML = `
                <div class="fav-icon" style="background: ${tool.color}">
                    <i class="fas ${tool.icon}"></i>
                </div>
                <span>${tool.name}</span>
            `;
            favItem.addEventListener('click', () => {
                navigateToTool(tool.path, tool.name);
            });
            grid.appendChild(favItem);
        }
    });
}

function openFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    const selector = document.getElementById('favoritesSelector');
    
    selector.innerHTML = '';
    
    ALL_TOOLS.forEach(tool => {
        const isChecked = userFavorites.includes(tool.id);
        const label = document.createElement('label');
        label.className = isChecked ? 'selected' : '';
        label.innerHTML = `
            <input type="checkbox" value="${tool.id}" ${isChecked ? 'checked' : ''}>
            <div class="selector-icon" style="background: ${tool.color}">
                <i class="fas ${tool.icon}"></i>
            </div>
            <span>${tool.name}</span>
        `;
        
        // Toggle clase selected
        label.querySelector('input').addEventListener('change', (e) => {
            label.classList.toggle('selected', e.target.checked);
            
            // Limitar a 8
            const checked = selector.querySelectorAll('input:checked');
            if (checked.length > 8) {
                e.target.checked = false;
                label.classList.remove('selected');
                showToast('Máximo 8 favoritos permitidos');
            }
        });
        
        selector.appendChild(label);
    });
    
    modal.classList.add('active');
}

function closeFavoritesModal() {
    document.getElementById('favoritesModal').classList.remove('active');
}

function saveFavorites() {
    const checkboxes = document.querySelectorAll('#favoritesSelector input[type="checkbox"]:checked');
    userFavorites = Array.from(checkboxes).map(cb => cb.value);
    
    localStorage.setItem('procore_sidebar_favorites', JSON.stringify(userFavorites));
    
    renderFavorites();
    closeFavoritesModal();
    showToast('Favoritos guardados');
}

/* ========================================
   TEMA
   ======================================== */
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    localStorage.setItem('procore_sidebar_theme', isDarkTheme ? 'dark' : 'light');
    updateThemeIcon();
    showToast(isDarkTheme ? 'Tema oscuro activado' : 'Tema claro activado');
}

function updateThemeIcon() {
    const icon = document.querySelector('#btnTheme i');
    icon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
}

/* ========================================
   ACTUALIZAR DATOS
   ======================================== */
function refreshData() {
    const btn = document.getElementById('btnRefresh');
    btn.querySelector('i').classList.add('fa-spin');
    
    // Simular actualización
    setTimeout(() => {
        // Actualizar badges con números aleatorios para demo
        updateBadge('rfiBadge', Math.floor(Math.random() * 10));
        updateBadge('submittalBadge', Math.floor(Math.random() * 15));
        updateBadge('punchBadge', Math.floor(Math.random() * 20));
        updateBadge('obsBadge', Math.floor(Math.random() * 8));
        
        btn.querySelector('i').classList.remove('fa-spin');
        showToast('Datos actualizados');
    }, 1000);
}

function updateBadge(badgeId, count) {
    const badge = document.getElementById(badgeId);
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/* ========================================
   TOAST NOTIFICATIONS
   ======================================== */
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
