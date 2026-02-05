/**
 * =============================================
 * RESUME PAGE - CERTIFICATE MANAGEMENT
 * WITH AUTHENTICATION PROTECTION
 * =============================================
 */

let currentCertId = null;

// Apply theme on load
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    loadCertificates();

    // File input change handler
    const certFileInput = document.getElementById('certFile');
    if (certFileInput) {
        certFileInput.addEventListener('change', function (e) {
            const fileName = e.target.files[0]?.name || 'No file chosen';
            document.getElementById('fileName').textContent = fileName;
        });
    }
});

// ============================================
// DEFAULT CERTIFICATES
// ============================================
const defaultCertificates = [
    {
        id: Date.now() + 1,
        name: "Cloud Foundations",
        issuer: "AWS Academy",
        image: "/assets/certificates/aws-cloud-foundations.png",
    },
    {
        id: Date.now() + 2,
        name: "Cloud Computing Fundamentals",
        issuer: "IBM",
        image: "../assets/certificates/ibm-cloud-computing-fundamentals.png",
    },
    {
        id: Date.now() + 3,
        name: "AWS Cloud Club Member",
        issuer: "AWS Cloud Club",
        image: "../assets/certificates/aws-cloud-club-member.png",
    }
];

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================
function getCertificates() {
    const stored = localStorage.getItem('portfolio-certificates');
    if (!stored) {
        localStorage.setItem('portfolio-certificates', JSON.stringify(defaultCertificates));
        return defaultCertificates;
    }
    return JSON.parse(stored);
}

function saveCertificates(certs) {
    // Only allow saving if authenticated
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        if (typeof showToast === 'function') {
            showToast('❌ Authentication required to modify certificates', 'error');
        }
        return false;
    }
    localStorage.setItem('portfolio-certificates', JSON.stringify(certs));
    return true;
}

// ============================================
// RENDER CERTIFICATES
// ============================================
function loadCertificates() {
    const certificates = getCertificates();
    const certList = document.getElementById('cert-list');

    if (!certList) return;

    if (certificates.length === 0) {
        certList.innerHTML = '<li style="text-align: center; padding: 20px; color: var(--text-secondary);">No certificates added yet</li>';
        return;
    }

    certList.innerHTML = certificates.map(cert => `
        <li onclick="showCert(${cert.id})" id="cert-${cert.id}">
            <div class="cert-info">
                <span class="cert-title">${cert.name}</span>
                <span class="cert-issuer">${cert.issuer}</span>
            </div>
            <div class="cert-actions-inline">
                <button class="icon-btn-small delete" onclick="event.stopPropagation(); deleteCert(${cert.id})" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </li>
    `).join('');
}

// ============================================
// SHOW CERTIFICATE
// ============================================
function showCert(certId) {
    const certificates = getCertificates();
    const cert = certificates.find(c => c.id === certId);

    if (!cert) return;

    currentCertId = certId;

    // Update UI
    const viewer = document.getElementById('cert-viewer');
    const placeholder = document.getElementById('preview-placeholder');
    const details = document.getElementById('cert-details');

    if (!viewer || !placeholder || !details) return;

    viewer.src = cert.image;
    viewer.style.display = 'block';
    placeholder.style.display = 'none';
    details.style.display = 'block';

    document.getElementById('cert-name').textContent = cert.name;
    document.getElementById('cert-issuer').textContent = cert.issuer;

    // Animate
    viewer.animate([
        { opacity: 0, transform: 'scale(0.95)' },
        { opacity: 1, transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });

    // Highlight active certificate
    document.querySelectorAll('.cert-list li').forEach(li => li.classList.remove('active'));
    document.getElementById(`cert-${certId}`)?.classList.add('active');
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function openCertModal() {
    // Check authentication - show login if not authenticated
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        } else {
            alert('Please login to add certificates');
        }
        return;
    }
    
    const modal = document.getElementById('certModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCertModal() {
    const modal = document.getElementById('certModal');
    if (modal) {
        modal.classList.remove('active');
    }
    const form = document.getElementById('certForm');
    if (form) {
        form.reset();
    }
    const fileName = document.getElementById('fileName');
    if (fileName) {
        fileName.textContent = 'No file chosen';
    }
}

// ============================================
// ADD CERTIFICATE
// ============================================
const certForm = document.getElementById('certForm');
if (certForm) {
    certForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Double-check authentication
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            if (typeof showToast === 'function') {
                showToast('❌ Session expired. Please login again.', 'error');
            }
            closeCertModal();
            if (typeof showLoginModal === 'function') {
                showLoginModal();
            }
            return;
        }

        const name = document.getElementById('certName').value;
        const issuer = document.getElementById('certIssuer').value;
        const fileInput = document.getElementById('certFile');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select an image file');
            return;
        }

        // Convert image to base64
        const reader = new FileReader();
        reader.onload = function (event) {
            const imageData = event.target.result;

            const certificates = getCertificates();
            const newCert = {
                id: Date.now(),
                name,
                issuer,
                image: imageData
            };

            certificates.push(newCert);
            if (saveCertificates(certificates)) {
                loadCertificates();
                closeCertModal();
                if (typeof showToast === 'function') {
                    showToast('✅ Certificate added successfully!', 'success');
                }
            }
        };

        reader.readAsDataURL(file);
    });
}

// ============================================
// DELETE CERTIFICATE
// ============================================
function deleteCert(certId) {
    // Check authentication - show login if not authenticated
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        } else {
            alert('Please login to delete certificates');
        }
        return;
    }
    
    if (confirm('Are you sure you want to delete this certificate?')) {
        let certificates = getCertificates();
        certificates = certificates.filter(c => c.id !== certId);
        if (saveCertificates(certificates)) {
            loadCertificates();
            if (typeof showToast === 'function') {
                showToast('✅ Certificate deleted successfully!', 'success');
            }

            // Clear preview if deleted cert was shown
            if (currentCertId === certId) {
                const viewer = document.getElementById('cert-viewer');
                const placeholder = document.getElementById('preview-placeholder');
                const details = document.getElementById('cert-details');

                if (viewer) viewer.style.display = 'none';
                if (details) details.style.display = 'none';
                if (placeholder) placeholder.style.display = 'block';
                currentCertId = null;
            }
        }
    }
}

// ============================================
// DOWNLOAD CERTIFICATE
// ============================================
function downloadCert() {
    if (!currentCertId) return;

    const certificates = getCertificates();
    const cert = certificates.find(c => c.id === currentCertId);

    if (!cert) return;

    const link = document.createElement('a');
    link.href = cert.image;
    link.download = `${cert.name.replace(/\s+/g, '_')}_Certificate.png`;
    link.click();
}

// Close modal when clicking outside
const certModal = document.getElementById('certModal');
if (certModal) {
    certModal.addEventListener('click', (e) => {
        if (e.target.id === 'certModal') {
            closeCertModal();
        }
    });
}

// Click on certificate viewer to open in new tab
const certViewer = document.getElementById('cert-viewer');
if (certViewer) {
    certViewer.addEventListener('click', function () {
        if (this.src && !this.src.includes('data:image/svg+xml')) {
            window.open(this.src, '_blank');
        }
    });
}
