/* ========================================
   PROCORE SIDEBAR - SOLUCIÓN FINAL
   Enlaces HTML puros - SIN JavaScript de navegación
   ======================================== */

// IDs de tu empresa (extraídos de tus URLs)
const COMPANY_ID = '562949953433037';
const PROJECT_ID = '562949955210139';
const BASE_DOMAIN = 'https://us02.procore.com';

// Rutas de herramientas
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
    '360-reporting': 'reports',
    'connection-manager': 'connection_manager'
};

// Lista para favoritos
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
   CONSTRUIR URL CORRECTA DE PROCORE
   ======================================== */
function buildToolUrl(toolId) {
    const route = TOOLS_ROUTES[toolId] || toolId;
    // Formato CORRECTO de Procore:
    return `${BASE_DOMAIN}/webclients/host/companies/${COMPANY_ID}/projects/${PROJECT_ID}/tools/${route}`;
}

/* ========================================
   INICIALIZACIÓN
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar TODOS los enlaces con URLs correctas y target="_top"
    updateAllToolLinks();
    
    // Configurar búsqueda y favoritos (sin afectar navegación)
    setupSearch();
    setupCollapsibleSections();
    setupFavoritesModal();
    setupThemeToggle();
    
    loadUserPreferences();
    renderFavorites();
    
    // Actualizar nombre del proyecto
    document.getElementById('projectName').textContent = 'Wiwynn SOCORRO';
    
    // Badges simulados
    setTimeout(() => {
        updateBadge('rfiBadge', 3);
        updateBadge('submittalBadge', 5);
        updateBadge('punchBadge', 12);
        updateBadge('obsBadge', 2);
    }, 500);
});

/* ========================================
   ACTUALIZAR TODOS LOS ENLACES
   Esta es la función CLAVE
   ======================================== */
function updateAllToolLinks() {
    document.querySelectorAll('.tool-item').forEach(item => {
        const toolId = item.dataset.tool;
        if (toolId) {
            const url = buildToolUrl(toolId);
            
            // Configurar el enlace correctamente
            item.href = url;
            item.target = '_top';  // ⭐ CLAVE: Navegar en ventana principal
            
            // NO agregar preventDefault - dejar que el enlace funcione naturalmente
            
            console.log(`Tool: ${toolId} -> ${url}`);
        }
    });
}

/* ========================================
   BÚSQUEDA (sin afectar navegación)
   ======================================== */
function setupSearch() {
    const searchInput = document.getElementById('searchTools');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            document.querySelectorAll('.tool-item').forEach(item => {
                const name = item.querySelector('span').textContent.toLowerCase();
                item.style.display = name.includes(query) || query === '' ? 'flex' : 'none';
            });
            
            // Expandir secciones si hay búsqueda
            if (query) {
                document.querySelectorAll('.tools-list').forEach(list => list.classList.remove('collapsed'));
                document.querySelectorAll('.section-header.collapsible').forEach(h => h.classList.remove('collapsed'));
            }
        });
    }
}

/* ========================================
   SECCIONES COLAPSABLES
   ======================================== */
function setupCollapsibleSections() {
    document.querySelectorAll('.section-header.collapsible').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            const toolsList = header.nextElementSibling;
            if (toolsList) toolsList.classList.toggle('collapsed');
        });
    });
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
    if (!grid) return;
    
    grid.innerHTML = '';
    
    userFavorites.slice(0, 8).forEach(favId => {
        const tool = ALL_TOOLS.find(t => t.id === favId);
        if (tool) {
            const url = buildToolUrl(tool.id);
            
            // Crear enlace HTML puro
            const link = document.createElement('a');
            link.className = 'favorite-item';
            link.href = url;
            link.target = '_top';  // ⭐ CLAVE
            link.innerHTML = `
                <div class="fav-icon" style="background: ${tool.color}">
                    <i class="fas ${tool.icon}"></i>
                </div>
                <span>${tool.name}</span>
            `;
            
            grid.appendChild(link);
        }
    });
}

function setupFavoritesModal() {
    const btnEdit = document.getElementById('btnEditFavorites');
    const btnClose = document.getElementById('closeFavorites');
    const btnCancel = document.getElementById('cancelFavorites');
    const btnSave = document.getElementById('saveFavorites');
    const modal = document.getElementById('favoritesModal');
    
    if (btnEdit) btnEdit.addEventListener('click', openFavoritesModal);
    if (btnClose) btnClose.addEventListener('click', closeFavoritesModal);
    if (btnCancel) btnCancel.addEventListener('click', closeFavoritesModal);
    if (btnSave) btnSave.addEventListener('click', saveFavorites);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'favoritesModal') closeFavoritesModal();
        });
    }
}

function openFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    const selector = document.getElementById('favoritesSelector');
    if (!modal || !selector) return;
    
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
    const modal = document.getElementById('favoritesModal');
    if (modal) modal.classList.remove('active');
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
function setupThemeToggle() {
    const btnTheme = document.getElementById('btnTheme');
    if (btnTheme) {
        btnTheme.addEventListener('click', toggleTheme);
    }
    
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', refreshData);
    }
}

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
    if (!btn) return;
    
    const icon = btn.querySelector('i');
    if (icon) icon.classList.add('fa-spin');
    
    setTimeout(() => {
        updateBadge('rfiBadge', Math.floor(Math.random() * 10) + 1);
        updateBadge('submittalBadge', Math.floor(Math.random() * 15) + 1);
        updateBadge('punchBadge', Math.floor(Math.random() * 20) + 1);
        updateBadge('obsBadge', Math.floor(Math.random() * 8) + 1);
        if (icon) icon.classList.remove('fa-spin');
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
// Método alternativo con formulario
function navigateWithForm(url) {
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = url;
    form.target = '_top';
    document.body.appendChild(form);
    form.submit();
}
