/* ========================================
   PROCORE SIDEBAR - JAVASCRIPT
   Versión corregida para navegación Procore
   ======================================== */

// Configuración
let PROCORE_CONFIG = {
    companyId: null,
    projectId: null,
    baseUrl: null
};

// Herramientas con sus rutas correctas en Procore
const TOOLS_MAP = {
    'home': 'home',
    'documents': 'documents',
    'directory': 'directory',
    'tasks': 'tasks',
    'admin': 'admin',
    'emails': 'emails',
    'rfis': 'rfis',
    'submittals': 'submittals',
    'transmittals': 'transmittals',
    'inspections': 'checklist/lists',
    'incidents': 'incidents',
    'observations': 'observations',
    'punch-list': 'punch_list',
    'meetings': 'meetings',
    'schedule': 'schedule',
    'daily-log': 'daily_log',
    'photos': 'images',
    'drawings': 'drawings',
    'specifications': 'specifications',
    'forms': 'generic_tools',
    'action-plans': 'action_plans',
    'budget': 'budgeting',
    'change-orders': 'prime_contracts',
    'commitments': 'work_order_contracts',
    'invoicing': 'payment_applications',
    'tm-tickets': 'time_and_material_entries',
    '360-reporting': 'portfolio/projects',
    'connection-manager': 'connection_manager'
};

// Lista de herramientas para favoritos
const ALL_TOOLS = [
    { id: 'home', name: 'Home', icon: 'fa-home', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'documents', name: 'Documents', icon: 'fa-folder-open', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'directory', name: 'Directory', icon: 'fa-address-book', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'rfis', name: 'RFIs', icon: 'fa-question-circle', color: 'linear-gradient(135deg, #F47E42 0%, #ff6b6b 100%)' },
    { id: 'submittals', name: 'Submittals', icon: 'fa-file-import', color: 'linear-gradient(135deg, #0076D6 0%, #00c6fb 100%)' },
    { id: 'daily-log', name: 'Daily Log', icon: 'fa-clipboard-list', color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'photos', name: 'Photos', icon: 'fa-camera', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { id: 'drawings', name: 'Drawings', icon: 'fa-drafting-compass', color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { id: 'punch-list', name: 'Punch List', icon: 'fa-list-check', color: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'schedule', name: 'Schedule', icon: 'fa-calendar-alt', color: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)' },
    { id: 'inspections', name: 'Inspections', icon: 'fa-clipboard-check', color: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)' },
    { id: 'forms', name: 'Forms', icon: 'fa-file-lines', color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    { id: 'observations', name: 'Observations', icon: 'fa-eye', color: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)' },
    { id: 'incidents', name: 'Incidents', icon: 'fa-exclamation-triangle', color: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)' },
    { id: 'meetings', name: 'Meetings', icon: 'fa-users', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { id: 'budget', name: 'Budget', icon: 'fa-calculator', color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' }
];

// Favoritos
let userFavorites = ['rfis', 'submittals', 'punch-list', 'daily-log', 'photos', 'drawings', 'schedule', 'forms'];
let isDarkTheme = false;

/* ========================================
   INICIALIZACIÓN
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    extractProcoreIds();
    setupEventListeners();
    loadUserPreferences();
    renderFavorites();
    setupCollapsibleSections();
    
    // Mostrar contadores simulados
    setTimeout(() => {
        updateBadge('rfiBadge', 3);
        updateBadge('submittalBadge', 5);
        updateBadge('punchBadge', 12);
        updateBadge('obsBadge', 2);
    }, 500);
});

function extractProcoreIds() {
    try {
        // Intentar obtener la URL del padre
        let parentUrl = '';
        
        try {
            parentUrl = window.top.location.href;
        } catch (e) {
            parentUrl = document.referrer;
        }
        
        console.log('Parent URL:', parentUrl);
        
        // Extraer Company ID y Project ID de la URL
        // Formato 1: /companies/XXXXX/projects/YYYYY
        // Formato 2: /XXXXX/company/projects/YYYYY
        // Formato 3: /XXXXX/project/apps/
        
        // Buscar company ID
        let companyMatch = parentUrl.match(/companies\/(\d+)/);
        if (companyMatch) {
            PROCORE_CONFIG.companyId = companyMatch[1];
        }
        
        // Buscar project ID
        let projectMatch = parentUrl.match(/projects\/(\d+)/);
        if (projectMatch) {
            PROCORE_CONFIG.projectId = projectMatch[1];
        }
        
        // Si no encontramos con el formato anterior, intentar otro
        if (!PROCORE_CONFIG.companyId || !PROCORE_CONFIG.projectId) {
            // Formato: us02.procore.com/562949955210139/project/apps/562949954023342
            const altMatch = parentUrl.match(/procore\.com\/(\d+)\/project/);
            if (altMatch) {
                PROCORE_CONFIG.projectId = altMatch[1];
            }
        }
        
        // Extraer el dominio base
        const domainMatch = parentUrl.match(/(https?:\/\/[^\/]+)/);
        if (domainMatch) {
            PROCORE_CONFIG.baseUrl = domainMatch[1];
        }
        
        console.log('Procore Config:', PROCORE_CONFIG);
        
        // Actualizar nombre del proyecto
        document.getElementById('projectName').textContent = 'Proyecto Activo';
        
    } catch (error) {
        console.error('Error extracting Procore IDs:', error);
    }
}

/* ========================================
   NAVEGACIÓN - VERSIÓN CORREGIDA
   ======================================== */
function navigateToTool(toolId, toolName) {
    showToast(`Abriendo ${toolName}...`);
    
    const toolPath = TOOLS_MAP[toolId] || toolId;
    
    try {
        // Obtener URL actual del navegador principal
        let currentUrl = '';
        try {
            currentUrl = window.top.location.href;
        } catch (e) {
            currentUrl = document.referrer;
        }
        
        console.log('Current URL:', currentUrl);
        console.log('Tool Path:', toolPath);
        
        // Extraer el dominio (ej: https://us02.procore.com)
        const domainMatch = currentUrl.match(/(https?:\/\/[^\/]+)/);
        const domain = domainMatch ? domainMatch[1] : 'https://us02.procore.com';
        
        // Extraer company_id del formato /companies/XXXXX/ o similar
        let companyId = null;
        let projectId = null;
        
        // Buscar en formato webclients
        const webClientMatch = currentUrl.match(/companies\/(\d+)\/projects\/(\d+)/);
        if (webClientMatch) {
            companyId = webClientMatch[1];
            projectId = webClientMatch[2];
        }
        
        // Si no, buscar en formato alternativo
        if (!companyId || !projectId) {
            const altMatch = currentUrl.match(/\/(\d+)\/(?:company\/)?projects?\/(\d+)/);
            if (altMatch) {
                companyId = altMatch[1];
                projectId = altMatch[2];
            }
        }
        
        // Si aún no tenemos project ID, buscar en cualquier parte
        if (!projectId) {
            const projMatch = currentUrl.match(/projects?\/(\d+)/);
            if (projMatch) {
                projectId = projMatch[1];
            }
        }
        
        // Buscar company ID en otro formato
        if (!companyId) {
            const compMatch = currentUrl.match(/\/(\d{15})\/project/);
            if (compMatch) {
                // En este caso el número es el project ID en formato largo
                projectId = compMatch[1];
            }
        }
        
        console.log('Company ID:', companyId);
        console.log('Project ID:', projectId);
        
        let targetUrl = '';
        
        if (companyId && projectId) {
            // Formato completo de URL de Procore
            targetUrl = `${domain}/webclients/host/companies/${companyId}/projects/${projectId}/tools/${toolPath}`;
        } else if (projectId) {
            // Intentar con solo project ID
            // Formato: https://us02.procore.com/562949955210139/project/tools/rfis
            targetUrl = `${domain}/${projectId}/project/tools/${toolPath}`;
        }
        
        console.log('Target URL:', targetUrl);
        
        if (targetUrl) {
            // Navegar en la ventana principal
            window.top.location.href = targetUrl;
        } else {
            showToast('Error: No se pudo determinar la URL');
        }
        
    } catch (error) {
        console.error('Navigation error:', error);
        showToast('Error al navegar. Usa el menú de Procore.');
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

    // Clicks en herramientas de la lista
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const toolId = item.dataset.tool;
            const toolName = item.querySelector('span').textContent;
            
            // Marcar como activo
            document.querySelectorAll('.tool-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            navigateToTool(toolId, toolName);
        });
    });

    // Botón actualizar
    document.getElementById('btnRefresh').addEventListener('click', refreshData);

    // Botón tema
    document.getElementById('btnTheme').addEventListener('click', toggleTheme);

    // Editar favoritos
    document.getElementById('btnEditFavorites').addEventListener('click', openFavoritesModal);

    // Modal
    document.getElementById('closeFavorites').addEventListener('click', closeFavoritesModal);
    document.getElementById('cancelFavorites').addEventListener('click', closeFavoritesModal);
    document.getElementById('saveFavorites').addEventListener('click', saveFavorites);
    document.getElementById('favoritesModal').addEventListener('click', (e) => {
        if (e.target.id === 'favoritesModal') closeFavoritesModal();
    });
}

/* ========================================
   SECCIONES COLAPSABLES
   ======================================== */
function setupCollapsibleSections() {
    document.querySelectorAll('.section-header.collapsible').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            header.nextElementSibling.classList.toggle('collapsed');
        });
    });
}

/* ========================================
   BÚSQUEDA
   ======================================== */
function filterTools(query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.tool-item').forEach(item => {
        const name = item.querySelector('span').textContent.toLowerCase();
        item.classList.toggle('hidden', !name.includes(q) && q !== '');
    });
    
    if (q) {
        document.querySelectorAll('.tools-list').forEach(list => list.classList.remove('collapsed'));
        document.querySelectorAll('.section-header.collapsible').forEach(h => h.classList.remove('collapsed'));
    }
}

/* ========================================
   FAVORITOS
   ======================================== */
function loadUserPreferences() {
    const saved = localStorage.getItem('procore_sidebar_favorites');
    if (saved) userFavorites = JSON.parse(saved);
    
    if (localStorage.getItem('procore_sidebar_theme') === 'dark') {
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
            const div = document.createElement('div');
            div.className = 'favorite-item';
            div.innerHTML = `
                <div class="fav-icon" style="background: ${tool.color}">
                    <i class="fas ${tool.icon}"></i>
                </div>
                <span>${tool.name}</span>
            `;
            div.addEventListener('click', () => navigateToTool(tool.id, tool.name));
            grid.appendChild(div);
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
        label.querySelector('input').addEventListener('change', (e) => {
            label.classList.toggle('selected', e.target.checked);
            if (selector.querySelectorAll('input:checked').length > 8) {
                e.target.checked = false;
                label.classList.remove('selected');
                showToast('Máximo 8 favoritos');
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
    userFavorites = Array.from(document.querySelectorAll('#favoritesSelector input:checked')).map(cb => cb.value);
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
    showToast(isDarkTheme ? 'Tema oscuro' : 'Tema claro');
}

function updateThemeIcon() {
    document.querySelector('#btnTheme i').className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
}

/* ========================================
   UTILIDADES
   ======================================== */
function refreshData() {
    const btn = document.getElementById('btnRefresh');
    btn.querySelector('i').classList.add('fa-spin');
    
    setTimeout(() => {
        updateBadge('rfiBadge', Math.floor(Math.random() * 10));
        updateBadge('submittalBadge', Math.floor(Math.random() * 15));
        updateBadge('punchBadge', Math.floor(Math.random() * 20));
        updateBadge('obsBadge', Math.floor(Math.random() * 8));
        btn.querySelector('i').classList.remove('fa-spin');
        showToast('Actualizado');
    }, 800);
}

function updateBadge(id, count) {
    const badge = document.getElementById(id);
    if (badge) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
