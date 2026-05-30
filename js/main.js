/**
 * Sistem Pelaporan Bencana Banjir
 * Main Application Entry Point
 */
import { router } from './router.js?v=24';
import { store } from './store.js?v=24';
import { getSession, showToast, showConfirm, clearSession } from './utils.js?v=24';

// Import Views
import { renderLoginView } from './views/login.js?v=24';
import { renderDistrictView } from './views/district-home.js?v=24';
import { renderFormView } from './views/form-entry.js?v=24';
import { renderPPSView } from './views/pps-management.js?v=24';
import { renderDashboardView } from './views/state-dashboard.js?v=24';

// Setup Toast Container
function setupAppUI() {
    // Add toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Add modal overlay if it doesn't exist
    if (!document.getElementById('modal-overlay')) {
        const modal = document.createElement('div');
        modal.id = 'modal-overlay';
        modal.className = 'modal-overlay hidden';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title" id="modal-title">Confirm</h3>
                    <button class="modal-close" id="modal-close">&times;</button>
                </div>
                <div class="modal-body" id="modal-body">
                    Are you sure?
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modal-btn-cancel">Batal</button>
                    <button class="btn btn-primary" id="modal-btn-confirm">Teruskan</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Register Routes
router.add('login', renderLoginView);
router.add('district', renderDistrictView);
router.add('pps', renderPPSView);
router.add('dashboard', renderDashboardView);
router.add('form/:formId', renderFormView);
router.add('submissions/:formId', renderFormView);

// Default route / Authentication guard
router.add('', () => {
    const session = getSession();
    if (!session) {
        router.navigate('login');
    } else if (session.role === 'state') {
        router.navigate('dashboard');
    } else if (session.role === 'district') {
        router.navigate('district');
    } else {
        router.navigate('login');
    }
});

// App Initialization
async function initApp() {
    setupAppUI();
    
    // Hide loading screen initially
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }

    // Initialize database
    try {
        await store.init();
        console.log('App Initialized Successfully');
        
        // Start router
        router.init();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showToast('Gagal memuatkan sistem pengkalan data', 'error');
    }
}

// Make sure global helpers are available
window.app = window.app || {};
window.app.logout = () => {
    showConfirm('Log Keluar?', 'Adakah anda pasti untuk log keluar?', () => {
        clearSession();
        router.navigate('login');
    });
};
window.app.closeModal = () => {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
};

// Bootstrap the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
