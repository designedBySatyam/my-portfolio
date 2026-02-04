/**
 * =============================================
 * PROJECTS PAGE - EDITABLE PROJECT MANAGEMENT
 * WITH AUTHENTICATION PROTECTION
 * =============================================
 */

// Apply theme on load
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    loadProjects();
});

// Icon SVG map
const iconMap = {
    database: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
    cpu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>',
    smartphone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
    layout: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
    code: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    server: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
    globe: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    terminal: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>'
};

// Default projects
const defaultProjects = [
    {
        id: Date.now() + 1,
        name: "Hospital Management System",
        description: "Designed a comprehensive database schema and ER diagram to manage healthcare records and staff scheduling.",
        icon: "database",
        tags: ["MySQL", "ER Diagram"]
    },
    {
        id: Date.now() + 2,
        name: "Full Adder Logic Circuit",
        description: "Engineered and simulated a full adder circuit by integrating two half adders and an OR gate for binary addition.",
        icon: "cpu",
        tags: ["Digital Logic", "Circuits"]
    },
    {
        id: Date.now() + 3,
        name: "Mobile Game Optimization",
        description: "Researched and implemented sensitivity optimizations for performance in high-paced mobile gaming environments.",
        icon: "smartphone",
        tags: ["Free Fire", "Optimization"]
    },
    {
        id: Date.now() + 4,
        name: "Portfolio Website",
        description: "A professional glassmorphism-based portfolio built with clean HTML, CSS, and interactive JavaScript effects.",
        icon: "layout",
        tags: ["Frontend", "Glassmorphism"]
    }
];

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================
function getProjects() {
    const stored = localStorage.getItem('portfolio-projects');
    if (!stored) {
        // Initialize with default projects
        localStorage.setItem('portfolio-projects', JSON.stringify(defaultProjects));
        return defaultProjects;
    }
    return JSON.parse(stored);
}

function saveProjects(projects) {
    // Only allow saving if authenticated
    if (!isAuthenticated()) {
        showToast('❌ Authentication required to modify projects', 'error');
        return false;
    }
    localStorage.setItem('portfolio-projects', JSON.stringify(projects));
    return true;
}

// ============================================
// RENDER PROJECTS
// ============================================
function loadProjects() {
    const projects = getProjects();
    const grid = document.getElementById('projects-grid');

    if (projects.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <h3>No Projects Yet</h3>
                <p>Start building your portfolio by adding your first project!</p>
                <button class="btn btn-primary" onclick="openProjectModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Your First Project
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-card-header">
                <div class="icon-box">${iconMap[project.icon] || iconMap.code}</div>
                <div class="project-content">
                    <h3>${project.name}</h3>
                </div>
            </div>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
            <div class="project-actions">
                <button class="icon-btn" onclick="editProject(${project.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit
                </button>
                <button class="icon-btn delete" onclick="deleteProject(${project.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function openProjectModal(projectId = null) {
    // Require authentication for modifications
    if (!requireAuth()) {
        return;
    }
    
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const modalTitle = document.getElementById('modalTitle');

    if (projectId) {
        // Edit mode
        const projects = getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            modalTitle.textContent = 'Edit Project';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectIcon').value = project.icon;
            document.getElementById('projectTags').value = project.tags.join(', ');
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Project';
        form.reset();
    }

    modal.classList.add('active');
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.getElementById('projectForm').reset();
}

// ============================================
// CRUD OPERATIONS
// ============================================
document.getElementById('projectForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Double-check authentication
    if (!isAuthenticated()) {
        showToast('❌ Session expired. Please login again.', 'error');
        closeProjectModal();
        showLoginModal();
        return;
    }

    const projectId = document.getElementById('projectId').value;
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;
    const icon = document.getElementById('projectIcon').value;
    const tagsInput = document.getElementById('projectTags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

    const projects = getProjects();

    if (projectId) {
        // Update existing project
        const index = projects.findIndex(p => p.id == projectId);
        if (index !== -1) {
            projects[index] = { id: parseInt(projectId), name, description, icon, tags };
        }
    } else {
        // Add new project
        const newProject = {
            id: Date.now(),
            name,
            description,
            icon,
            tags
        };
        projects.push(newProject);
    }

    if (saveProjects(projects)) {
        loadProjects();
        closeProjectModal();
        showToast('✅ Project saved successfully!', 'success');
    }
});

function editProject(projectId) {
    openProjectModal(projectId);
}

function deleteProject(projectId) {
    // Require authentication
    if (!requireAuth()) {
        return;
    }
    
    if (confirm('Are you sure you want to delete this project?')) {
        let projects = getProjects();
        projects = projects.filter(p => p.id !== projectId);
        if (saveProjects(projects)) {
            loadProjects();
            showToast('✅ Project deleted successfully!', 'success');
        }
    }
}

// Close modal when clicking outside
document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        closeProjectModal();
    }
});
