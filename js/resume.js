/**
 * =============================================
 * RESUME PAGE - CERTIFICATE MANAGEMENT
 * =============================================
 */

let currentCertId = null;

// Apply theme on load
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    loadCertificates();

    // File input change handler
    document.getElementById('certFile').addEventListener('change', function (e) {
        const fileName = e.target.files[0]?.name || 'No file chosen';
        document.getElementById('fileName').textContent = fileName;
    });
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
    localStorage.setItem('portfolio-certificates', JSON.stringify(certs));
}

// ============================================
// RENDER CERTIFICATES
// ============================================
function loadCertificates() {
    const certificates = getCertificates();
    const certList = document.getElementById('cert-list');

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
    const modal = document.getElementById('certModal');
    modal.classList.add('active');
}

function closeCertModal() {
    const modal = document.getElementById('certModal');
    modal.classList.remove('active');
    document.getElementById('certForm').reset();
    document.getElementById('fileName').textContent = 'No file chosen';
}

// ============================================
// ADD CERTIFICATE
// ============================================
document.getElementById('certForm').addEventListener('submit', async (e) => {
    e.preventDefault();

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
        saveCertificates(certificates);
        loadCertificates();
        closeCertModal();
    };

    reader.readAsDataURL(file);
});

// ============================================
// DELETE CERTIFICATE
// ============================================
function deleteCert(certId) {
    if (confirm('Are you sure you want to delete this certificate?')) {
        let certificates = getCertificates();
        certificates = certificates.filter(c => c.id !== certId);
        saveCertificates(certificates);
        loadCertificates();

        // Clear preview if deleted cert was shown
        if (currentCertId === certId) {
            const viewer = document.getElementById('cert-viewer');
            const placeholder = document.getElementById('preview-placeholder');
            const details = document.getElementById('cert-details');

            viewer.style.display = 'none';
            details.style.display = 'none';
            placeholder.style.display = 'block';
            currentCertId = null;
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
document.getElementById('certModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'certModal') {
        closeCertModal();
    }
});

// Click on certificate viewer to open in new tab
document.getElementById('cert-viewer')?.addEventListener('click', function () {
    if (this.src && !this.src.includes('data:image/svg+xml')) {
        window.open(this.src, '_blank');
    }
});
