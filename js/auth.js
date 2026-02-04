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
    passwordHash: "bXlTZWN1cmVQYXNzMTIz",
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
                    <div class="auth-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h2>Authentication Required</h2>
                    <p class="auth-subtitle">Enter password to modify content</p>
                    <button class="close-btn" onclick="closeAuthModal()">&times;</button>
                </div>
                <div class="auth-body">
                    <form id="authForm">
                        <div class="form-group">
                            <label for="authPassword">Password</label>
                            <input 
                                type="password" 
                                id="authPassword" 
                                placeholder="Enter your password" 
                                required
                                autocomplete="current-password"
                            >
                        </div>
                        <div id="authError" class="auth-error" style="display: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            Incorrect password
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="closeAuthModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                    <polyline points="10 17 15 12 10 7"></polyline>
                                    <line x1="15" y1="12" x2="3" y2="12"></line>
                                </svg>
                                Login
                            </button>
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
                showToast('✨ Authentication successful!', 'success');
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
    
    // Update all modification buttons - more specific selectors
    const modifyButtons = document.querySelectorAll(
        '.add-project-btn, .icon-btn, .icon-btn-small, button[onclick*="openCertModal"], button[onclick*="openProjectModal"], button[onclick*="edit"], button[onclick*="delete"]'
    );
    
    modifyButtons.forEach(btn => {
        if (authenticated) {
            btn.classList.remove('auth-protected');
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            btn.disabled = false;
        } else {
            btn.classList.add('auth-protected');
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
            btn.disabled = true;
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
    
    // Update UI again after a short delay to catch dynamically loaded buttons
    setTimeout(() => {
        updateUIForAuth();
    }, 500);
    
    // Add CSS if not already added
    if (!document.getElementById('auth-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = `
            /* Authentication Modal Styles */
            .auth-modal {
                max-width: 480px;
                padding: 0;
                overflow: hidden;
            }
            
            .auth-modal .modal-header {
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                padding: 40px 35px 35px;
                text-align: center;
                position: relative;
                border-bottom: none;
            }
            
            .auth-icon {
                width: 64px;
                height: 64px;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }
            
            .auth-modal .modal-header h2 {
                color: white;
                margin: 0 0 8px 0;
                font-size: 1.75rem;
                font-weight: 700;
            }
            
            .auth-subtitle {
                color: rgba(255, 255, 255, 0.9);
                margin: 0;
                font-size: 0.95rem;
            }
            
            .auth-modal .close-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 8px;
                font-size: 1.5rem;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .auth-modal .close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            .auth-body {
                padding: 35px;
                background: var(--background);
            }
            
            .auth-body .form-group {
                margin-bottom: 20px;
            }
            
            .auth-body label {
                display: block;
                margin-bottom: 10px;
                font-weight: 600;
                color: var(--text-light);
                font-size: 0.95rem;
            }
            
            .auth-body input[type="password"] {
                width: 100%;
                padding: 14px 18px;
                border: 2px solid var(--border);
                border-radius: 12px;
                font-size: 1rem;
                font-family: inherit;
                background: var(--background);
                color: var(--text-light);
                transition: var(--transition);
                box-sizing: border-box;
            }
            
            .auth-body input[type="password"]:focus {
                outline: none;
                border-color: var(--primary);
                background: rgba(99, 102, 241, 0.05);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }
            
            .auth-error {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #ef4444;
                padding: 12px 16px;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 10px;
                margin-bottom: 20px;
                font-size: 0.9rem;
                font-weight: 500;
                animation: shakeError 0.4s ease;
            }
            
            .auth-error svg {
                flex-shrink: 0;
            }
            
            @keyframes shakeError {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                75% { transform: translateX(8px); }
            }
            
            .auth-body .form-actions {
                display: flex;
                gap: 12px;
                margin-top: 25px;
            }
            
            .auth-body .form-actions .btn {
                flex: 1;
                justify-content: center;
                padding: 13px 24px;
                font-size: 0.95rem;
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
                gap: 12px;
                padding: 14px 22px;
                background: var(--glass);
                backdrop-filter: blur(15px);
                border: 1px solid var(--border);
                border-radius: 50px;
                font-size: 0.9rem;
                font-weight: 600;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                transition: var(--transition);
            }
            
            .auth-status:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
            }
            
            .auth-status.authenticated {
                color: #22c55e;
                border-color: rgba(34, 197, 94, 0.3);
            }
            
            .auth-status.authenticated svg {
                color: #22c55e;
            }
            
            .auth-status.not-authenticated {
                color: var(--text-secondary);
            }
            
            .auth-status svg {
                flex-shrink: 0;
            }
            
            .login-btn, .logout-btn {
                padding: 7px 16px;
                border-radius: 20px;
                border: none;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                margin-left: 5px;
                font-family: inherit;
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
                background: rgba(239, 68, 68, 0.15);
                color: #ef4444;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }
            
            .logout-btn:hover {
                background: rgba(239, 68, 68, 0.25);
            }
            
            /* Toast Notifications */
            .auth-toast {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 16px 26px;
                background: var(--glass);
                backdrop-filter: blur(15px);
                border: 1px solid var(--border);
                border-radius: 14px;
                font-weight: 600;
                z-index: 1001;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                font-size: 0.95rem;
            }
            
            .auth-toast.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .auth-toast-success {
                color: #22c55e;
                border-color: rgba(34, 197, 94, 0.3);
                background: rgba(34, 197, 94, 0.1);
                backdrop-filter: blur(15px);
            }
            
            .auth-toast-error {
                color: #ef4444;
                border-color: rgba(239, 68, 68, 0.3);
                background: rgba(239, 68, 68, 0.1);
                backdrop-filter: blur(15px);
            }
            
            /* Protected elements */
            .auth-protected {
                cursor: not-allowed !important;
                filter: grayscale(0.3);
                position: relative;
            }
            
            .auth-protected::after {
                content: '🔒';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.85rem;
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
            }
            
            .auth-protected:hover::after {
                opacity: 0.6;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @media (max-width: 768px) {
                .auth-modal {
                    max-width: 90%;
                    margin: 20px;
                }
                
                .auth-modal .modal-header {
                    padding: 35px 25px 30px;
                }
                
                .auth-icon {
                    width: 56px;
                    height: 56px;
                }
                
                .auth-modal .modal-header h2 {
                    font-size: 1.5rem;
                }
                
                .auth-body {
                    padding: 25px 20px;
                }
                
                .auth-body .form-actions {
                    flex-direction: column;
                }
                
                .auth-body .form-actions .btn {
                    width: 100%;
                }
                
                .auth-indicator {
                    bottom: 15px;
                    right: 15px;
                    left: 15px;
                }
                
                .auth-status {
                    justify-content: center;
                    width: 100%;
                }
                
                .auth-toast {
                    right: 15px;
                    left: 15px;
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
