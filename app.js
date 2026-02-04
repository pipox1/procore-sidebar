/* ========================================
   PROCORE SIDEBAR - VERSIÓN FINAL
   URLs CORREGIDAS
   ======================================== */

// IDs extraídos de tu Procore
let COMPANY_ID = '562949953433037';
let PROJECT_ID = '562949955210139';
let BASE_DOMAIN = 'https://us02.procore.com';

// Mapeo de herramientas a sus rutas
const TOOLS_ROUTES = {
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
    'forms': 'forms',
    'action-plans': 'action_plans',
    'budget': 'budgeting/budget',
    'change-orders': 'change_orders',
    'commitments': 'commitments',
    'invoicing': 'invoices',
    'tm-tickets': 'timesheets',
    '360-reporting': 'reports',
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

let userFavorites = ['rfis', 'submittals', 'punch-list', 'daily-log', 'photos', 'drawings', 'schedule', 'forms'];
let isDarkTheme = false;

/* ========================================
   INICIALIZACIÓN
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    extractIdsFromUrl();
    setupEventListeners();
    loadUserPreferences();
    renderFavorites();
    setupCollapsibleSections();
    
    setTimeout(() => {
        updateBadge('rfiBadge', 3);
        updateBadge('submittalBadge', 5);
        updateBadge('punchBadge', 12);
        updateBadge('obsBadge', 2);
    }, 500);
    
    // Auto-navegar a Home si estamos en página de apps
    autoNavigateToHome();
});

/* ========================================
   EXTRAER IDs DE LA URL
   ======================================== */
function extractIdsFromUrl() {
    try {
        let url = '';
        try {
            url = window.top.location.href;
        } catch (e) {
            url = document.referrer;
        }
        
        console.log('URL detectada:', url);
        
        // Extraer dominio
        const domainMatch = url.match(/(https?:\/\/[^\/]+)/);
        if (domainMatch) {
            BASE_DOMAIN = domainMatch[1];
        }
        
        // Extraer Company ID y Project ID del formato webclients
        // Formato: /webclients/host/companies/XXXXX/projects/YYYYY/
        const webClientMatch = url.match(/companies\/(\d+)\/projects\/(\d+)/);
        if (webClientMatch) {
            COMPANY_ID = webClientMatch[1];
            PROJECT_ID = webClientMatch[2];
            console.log('IDs extraídos (webclients):', COMPANY_ID, PROJECT_ID);
        } else {
            // Formato alternativo: /XXXXX/project/apps/YYYYY
            const altMatch = url.match(/\/(\d+)\/project/);
            if (altMatch) {
                PROJECT_ID = altMatch[1];
                console.log('Project ID extraído (alt):', PROJECT_ID);
            }
        }
        
        // Actualizar UI
        document.getElementById('projectName').textContent = 'Wiwynn SOCORRO';
        
    } catch (error) {
        console.error('Error extrayendo IDs:', error);
    }
}

/* ========================================
   CONSTRUIR URL CORRECTA DE PROCORE
   ======================================== */
function buildToolUrl(toolId) {
    const route = TOOLS_ROUTES[toolId] || toolId;
    
    // Formato correcto de Procore:
    // https://us02.procore.com/webclients/host/companies/{company}/projects/{project}/tools/{tool}
    return `${BASE_DOMAIN}/webclients/host/companies/${COMPANY_ID}/projects/${PROJECT_ID}/tools/${route}`;
}

/* ========================================
   AUTO-NAVEGACIÓN A HOME
   ======================================== */
function autoNavigateToHome() {
    const alreadyNavigated = sessionStorage.getItem('procore_auto_nav');
    if (alreadyNavigated) return;
    
    try {
        const url = window.top.location.href;
        if (url.includes('/project/apps/')) {
            sessionStorage.setItem('procore_auto_nav', 'true');
            setTimeout(() => {
                navigateToTool('home', 'Home');
            }, 400);
        }
    } catch (e) {
        console.log('No se pudo verificar URL');
    }
}

/* ========================================
   NAVEGACIÓN
   ======================================== */
function navigateToTool(toolId, toolName) {
    const url = buildToolUrl(toolId);
    
    console.log('============================================');
    console.log('Navegando a:', toolName);
    console.log('URL generada:', url);
    console.log('============================================');
    
    // Marcar como activo
    document.querySelectorAll('.tool-item').forEach(i => i.classList.remove('active'));
    const activeItem = document.querySelector(`[data-tool="${toolId}"]`);
    if (activeItem) activeItem.classList.add('active');
    
    // Navegar a la URL
    try {
        window.top.location.href = url;
    } catch (e) {
        // Si falla, intentar con window.open
        window.open(url, '_top');
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
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const toolId = item.dataset.tool;
            const toolName = item.querySelector('span').textContent;
            
            navigateToTool(toolId, toolName);
        });
    });

    // Botones footer
    document.getElementById('btnRefresh').addEventListener('click', refreshData);
    document.getElementById('btnTheme').addEventListener('click', toggleTheme);

    // Favoritos
    document.getElementById('btnEditFavorites').addEventListener('click', openFavoritesModal);
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
    if (saved) {
        try { userFavorites = JSON.parse(saved); } catch (e) {}
    }
    
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
            div.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToTool(tool.id, tool.name);
            });
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
    const checked = document.querySelectorAll('#favoritesSelector input:checked');
    userFavorites = Array.from(checked).map(cb => cb.value);
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
    const icon = document.querySelector('#btnTheme i');
    if (icon) icon.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
}

/* ========================================
   UTILIDADES
   ======================================== */
function refreshData() {
    const btn = document.getElementById('btnRefresh');
    const icon = btn.querySelector('i');
    icon.classList.add('fa-spin');
    
    sessionStorage.removeItem('procore_auto_nav');
    
    setTimeout(() => {
        updateBadge('rfiBadge', Math.floor(Math.random() * 10) + 1);
        updateBadge('submittalBadge', Math.floor(Math.random() * 15) + 1);
        updateBadge('punchBadge', Math.floor(Math.random() * 20) + 1);
        updateBadge('obsBadge', Math.floor(Math.random() * 8) + 1);
        icon.classList.remove('fa-spin');
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
    const msg = document.getElementById('toastMessage');
    if (toast && msg) {
        msg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
}
