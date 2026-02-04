/**
 * =============================================
 * AUTHENTICATION SYSTEM
 * Protects data modification while allowing viewing
 * =============================================
 */

// Configuration
const AUTH_CONFIG = {
    // Change this to your desired password hash
    // Current password: "mySecurePass123" 
    // To generate new hash: console.log(btoa("yourNewPassword"))
    passwordHash: "WW91ck5ld1Bhc3N3b3JkMTIz",
    sessionKey: "portfolio-auth-session",
    sessionDuration: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const session = localStorage.getItem(AUTH_CONFIG.sessionKey);
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        
        // Check if session is still valid
        if (sessionData.expires > now && sessionData.authenticated === true) {
            return true;
        } else {
            // Session expired, clear it
            logout();
            return false;
        }
    } catch (e) {
        return false;
    }
}

/**
 * Verify password and create session
 */
function login(password) {
    const hash = btoa(password);
    
    if (hash === AUTH_CONFIG.passwordHash) {
        const sessionData = {
            authenticated: true,
            expires: Date.now() + AUTH_CONFIG.sessionDuration,
            timestamp: Date.now()
        };
        
        localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(sessionData));
        return true;
    }
    
    return false;
}

/**
 * Clear authentication session
 */
function logout() {
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    updateUIForAuth();
}

/**
 * Show login modal
 */
function showLoginModal() {
    // Check if modal already exists
    let modal = document.getElementById('authModal');
    
    if (!modal) {
        // Create modal
        modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h2>🔒 Authentication Required</h2>
                    <button class="close-btn" onclick="closeAuthModal()">&times;</button>
                </div>
                <div class="auth-body">
                    <p>Enter password to modify content:</p>
                    <form id="authForm">
                        <div class="form-group">
                            <input 
                                type="password" 
                                id="authPassword" 
                                placeholder="Enter password" 
                                required
                                autocomplete="current-password"
                            >
                        </div>
                        <div id="authError" class="auth-error" style="display: none;">
                            ❌ Incorrect password
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="closeAuthModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add form submit handler
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('authPassword').value;
            const errorDiv = document.getElementById('authError');
            
            if (login(password)) {
                closeAuthModal();
                updateUIForAuth();
                // Show success message
                showToast('✅ Authentication successful!', 'success');
            } else {
                errorDiv.style.display = 'block';
                document.getElementById('authPassword').value = '';
                document.getElementById('authPassword').focus();
                
                // Hide error after 3 seconds
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 3000);
            }
        });
    } else {
        modal.classList.add('active');
    }
    
    // Focus password input
    setTimeout(() => {
        document.getElementById('authPassword')?.focus();
    }, 100);
}

/**
 * Close login modal
 */
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('authPassword').value = '';
        document.getElementById('authError').style.display = 'none';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.auth-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `auth-toast auth-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Update UI based on authentication status
 */
function updateUIForAuth() {
    const authenticated = isAuthenticated();
    
    // Update all modification buttons
    const modifyButtons = document.querySelectorAll(
        '.add-project-btn, .icon-btn, .cert-actions .btn-primary, .icon-btn-small'
    );
    
    modifyButtons.forEach(btn => {
        if (authenticated) {
            btn.classList.remove('auth-protected');
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        } else {
            btn.classList.add('auth-protected');
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        }
    });
    
    // Show/hide auth indicator
    updateAuthIndicator(authenticated);
}

/**
 * Show authentication status indicator
 */
function updateAuthIndicator(authenticated) {
    let indicator = document.querySelector('.auth-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'auth-indicator';
        document.body.appendChild(indicator);
    }
    
    if (authenticated) {
        indicator.innerHTML = `
            <div class="auth-status authenticated">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Authenticated</span>
                <button onclick="logout()" class="logout-btn">Logout</button>
            </div>
        `;
    } else {
        indicator.innerHTML = `
            <div class="auth-status not-authenticated">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
                <span>View Only</span>
                <button onclick="showLoginModal()" class="login-btn">Login</button>
            </div>
        `;
    }
}

/**
 * Require authentication for action
 * Returns true if authenticated, shows login modal if not
 */
function requireAuth(callback) {
    if (isAuthenticated()) {
        if (callback) callback();
        return true;
    } else {
        showLoginModal();
        return false;
    }
}

/**
 * Initialize authentication system
 */
function initAuth() {
    // Update UI on page load
    updateUIForAuth();
    
    // Add CSS if not already added
    if (!document.getElementById('auth-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = `
            /* Authentication Modal Styles */
            .auth-modal {
                max-width: 450px;
            }
            
            .auth-body {
                padding: 30px;
            }
            
            .auth-body p {
                margin-bottom: 20px;
                color: var(--text-secondary);
            }
            
            .auth-error {
                color: #ef4444;
                padding: 10px;
                background: rgba(239, 68, 68, 0.1);
                border-radius: 8px;
                margin: 15px 0;
                font-size: 0.9rem;
            }
            
            /* Auth Indicator */
            .auth-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 99;
                animation: slideInUp 0.4s ease-out;
            }
            
            .auth-status {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 20px;
                background: var(--glass);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border);
                border-radius: 50px;
                font-size: 0.9rem;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            .auth-status.authenticated {
                color: #22c55e;
                border-color: rgba(34, 197, 94, 0.3);
            }
            
            .auth-status.not-authenticated {
                color: var(--text-secondary);
            }
            
            .auth-status svg {
                flex-shrink: 0;
            }
            
            .login-btn, .logout-btn {
                padding: 6px 14px;
                border-radius: 20px;
                border: none;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                margin-left: 5px;
            }
            
            .login-btn {
                background: var(--primary);
                color: white;
            }
            
            .login-btn:hover {
                background: var(--primary-hover);
                transform: scale(1.05);
            }
            
            .logout-btn {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .logout-btn:hover {
                background: rgba(239, 68, 68, 0.2);
            }
            
            /* Toast Notifications */
            .auth-toast {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 15px 25px;
                background: var(--glass);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border);
                border-radius: 12px;
                font-weight: 600;
                z-index: 1001;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            .auth-toast.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .auth-toast-success {
                color: #22c55e;
                border-color: rgba(34, 197, 94, 0.3);
            }
            
            .auth-toast-error {
                color: #ef4444;
                border-color: rgba(239, 68, 68, 0.3);
            }
            
            /* Protected elements */
            .auth-protected {
                cursor: not-allowed !important;
                filter: grayscale(0.5);
            }
            
            @media (max-width: 768px) {
                .auth-indicator {
                    bottom: 10px;
                    right: 10px;
                }
                
                .auth-status span {
                    display: none;
                }
                
                .auth-toast {
                    right: 10px;
                    left: 10px;
                    top: 70px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Close modal on outside click
    document.addEventListener('click', (e) => {
        if (e.target.id === 'authModal') {
            closeAuthModal();
        }
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
