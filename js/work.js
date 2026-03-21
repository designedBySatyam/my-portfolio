/**
 * ============================================
 * PROJECTS & CERTIFICATES PAGE SCRIPT
 * ============================================
 */

'use strict';

class UrlState {
    static get(key, fallback = '') {
        const value = new URLSearchParams(window.location.search).get(key);
        return value === null ? fallback : value;
    }

    static set(values = {}) {
        const params = new URLSearchParams(window.location.search);

        Object.entries(values).forEach(([key, rawValue]) => {
            const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
            const remove =
                value === undefined ||
                value === null ||
                value === '' ||
                (key === 'view' && value === 'projects') ||
                (key === 'status' && value === 'all') ||
                (key === 'sort' && value === 'order-asc') ||
                (key === 'certSort' && value === 'order-asc');

            if (remove) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
    }
}

class ViewToggle {
    constructor() {
        this.projectsToggle = document.getElementById('projectsToggle');
        this.certificatesToggle = document.getElementById('certificatesToggle');
        this.projectsSection = document.getElementById('projectsSection');
        this.certificatesSection = document.getElementById('certificatesSection');
        this.pageTitle = document.getElementById('titleText');
        this.pageSubtitle = document.getElementById('pageSubtitle');

        // Support both ?view= param and #certificates hash (from resume page link)
        const hash = window.location.hash.replace('#', '').toLowerCase();
        const requestedView = hash === 'certificates'
            ? 'certificates'
            : UrlState.get('view', 'projects');
        this.currentView = requestedView === 'certificates' ? 'certificates' : 'projects';

        // Clear the hash so it doesn't persist on tab switch
        if (hash === 'certificates') {
            window.history.replaceState({}, '', window.location.pathname);
        }

        this.init();
    }

    init() {
        if (!this.projectsToggle || !this.certificatesToggle || !this.projectsSection || !this.certificatesSection) {
            return;
        }

        this.projectsToggle.addEventListener('click', () => this.switchView('projects'));
        this.certificatesToggle.addEventListener('click', () => this.switchView('certificates'));
        this.applyView(false);
    }

    applyView(syncUrl = true) {
        const isProjects = this.currentView === 'projects';

        this.projectsToggle.classList.toggle('active', isProjects);
        this.certificatesToggle.classList.toggle('active', !isProjects);
        this.projectsSection.classList.toggle('active', isProjects);
        this.certificatesSection.classList.toggle('active', !isProjects);

        this.projectsToggle.setAttribute('aria-pressed', String(isProjects));
        this.certificatesToggle.setAttribute('aria-pressed', String(!isProjects));
        this.projectsSection.setAttribute('aria-hidden', String(!isProjects));
        this.certificatesSection.setAttribute('aria-hidden', String(isProjects));

        if (isProjects) {
            if (this.pageTitle) this.pageTitle.textContent = 'PROJECTS';
            if (this.pageSubtitle) this.pageSubtitle.textContent = 'Innovative solutions at the intersection of technology and creativity';
        } else {
            if (this.pageTitle) this.pageTitle.textContent = 'CERTIFICATES';
            if (this.pageSubtitle) this.pageSubtitle.textContent = 'Professional achievements and continuous learning journey';
        }

        if (syncUrl) {
            UrlState.set({ view: this.currentView });
        }
    }

    switchView(view) {
        if (this.currentView === view) return;
        this.currentView = view;
        this.applyView(true);
    }
}

function toEpochMs(value) {
    if (!value) return null;
    if (typeof value?.toDate === 'function') {
        const date = value.toDate();
        return Number.isFinite(date?.getTime?.()) ? date.getTime() : null;
    }
    if (value instanceof Date) {
        const ms = value.getTime();
        return Number.isFinite(ms) ? ms : null;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const ms = Date.parse(value.trim());
        return Number.isFinite(ms) ? ms : null;
    }
    if (typeof value === 'object' && Number.isFinite(value.seconds)) {
        return Number(value.seconds) * 1000;
    }
    return null;
}

function getRecordTime(record, fields = []) {
    for (const field of fields) {
        const ms = toEpochMs(record?.[field]);
        if (Number.isFinite(ms)) return ms;
    }
    return null;
}

class FirebaseProjects {
    constructor() {
        this.projectsContainer = document.getElementById('projectsGrid');
        this.searchInput = document.getElementById('projectSearchInput');
        this.statusFilter = document.getElementById('projectStatusFilter');
        this.sortOrder = document.getElementById('projectSortOrder');
        this.projectsMeta = document.getElementById('projectsMeta');
        this.techChips = document.getElementById('projectTechChips');

        this.allProjects = [];
        this.selectedTechChip = UrlState.get('tech', '').toLowerCase();
        this.init();
    }

    init() {
        if (!this.projectsContainer) return;

        if (typeof db === 'undefined' || !db) {
            console.error('Firebase not initialized');
            this.showError();
            return;
        }

        const initialQuery = UrlState.get('q', '');
        const initialStatus = UrlState.get('status', 'all').toLowerCase();
        const initialSort = UrlState.get('sort', 'order-asc').toLowerCase();

        if (this.searchInput) this.searchInput.value = initialQuery;
        if (this.statusFilter && [...this.statusFilter.options].some((opt) => opt.value === initialStatus)) {
            this.statusFilter.value = initialStatus;
        }
        if (this.sortOrder && [...this.sortOrder.options].some((opt) => opt.value === initialSort)) {
            this.sortOrder.value = initialSort;
        }

        this.bindProjectControls();
        this.showLoading();
        this.loadProjects();
    }

    bindProjectControls() {
        const apply = () => this.applyProjectFilters();
        this.searchInput?.addEventListener('input', apply);
        this.statusFilter?.addEventListener('change', apply);
        this.sortOrder?.addEventListener('change', apply);
    }

    showLoading() {
        if (this.projectsMeta) this.projectsMeta.textContent = 'Loading projects...';
        this.projectsContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading projects...</p>
            </div>
        `;
    }

    showError() {
        if (this.projectsMeta) this.projectsMeta.textContent = 'Unable to load projects';
        this.projectsContainer.innerHTML = `
            <div class="error-state">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Failed to load projects. Please check Firebase configuration.</p>
            </div>
        `;
    }

    showEmptyState(message = 'Projects will appear here once added through the admin panel.', title = 'No Projects Yet') {
        if (this.projectsMeta) this.projectsMeta.textContent = '0 projects';
        this.projectsContainer.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                <h3>${this.escapeHtml(title)}</h3>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    loadProjects() {
        db.collection(COLLECTIONS.PROJECTS)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const projects = [];
                snapshot.forEach((doc) => projects.push({ id: doc.id, ...doc.data() }));
                this.allProjects = projects;
                this.renderTechChips();
                this.applyProjectFilters();
            }, (error) => {
                console.error('Error loading projects:', error);
                this.showError();
            });
    }

    normalizeTechnologies(value) {
        if (Array.isArray(value)) {
            return value.map((item) => String(item || '').trim()).filter(Boolean);
        }
        if (typeof value === 'string') {
            return value.split(',').map((item) => item.trim()).filter(Boolean);
        }
        return [];
    }

    normalizeStatus(value) {
        const text = String(value || 'Completed').trim();
        const key = text.toLowerCase();
        const allowed = new Set(['completed', 'active', 'research', 'planning']);
        return {
            label: text || 'Completed',
            className: allowed.has(key) ? key : 'completed'
        };
    }

    normalizeProjectLink(value) {
        const link = String(value || '').trim();
        if (!link) return '';
        if (/^https?:\/\//i.test(link)) return link;
        return '';
    }

    sortProjects(projects, sortValue) {
        const list = [...projects];
        if (sortValue === 'title-asc') {
            list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
            return list;
        }
        if (sortValue === 'title-desc') {
            list.sort((a, b) => String(b.title || '').localeCompare(String(a.title || '')));
            return list;
        }
        if (sortValue === 'time-desc' || sortValue === 'time-asc') {
            const dir = sortValue === 'time-desc' ? -1 : 1;
            list.sort((a, b) => {
                const aTime = getRecordTime(a, ['createdAt', 'updatedAt']);
                const bTime = getRecordTime(b, ['createdAt', 'updatedAt']);
                if (aTime !== null || bTime !== null) {
                    if (aTime === null) return 1;
                    if (bTime === null) return -1;
                    if (aTime !== bTime) return dir * (aTime - bTime);
                }
                const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
                const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
                if (aOrder !== bOrder) return dir * (aOrder - bOrder);
                return String(a.title || '').localeCompare(String(b.title || ''));
            });
            return list;
        }
        return list;
    }

    renderTechChips() {
        if (!this.techChips) return;

        const map = new Map();
        this.allProjects.forEach((project) => {
            this.normalizeTechnologies(project.technologies).forEach((tech) => {
                const key = tech.toLowerCase();
                if (!map.has(key)) {
                    map.set(key, { label: tech, count: 0 });
                }
                map.get(key).count += 1;
            });
        });

        const chips = [...map.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10);

        if (!chips.length) {
            this.techChips.innerHTML = '';
            this.selectedTechChip = '';
            UrlState.set({ tech: '' });
            return;
        }

        if (this.selectedTechChip && !map.has(this.selectedTechChip)) {
            this.selectedTechChip = '';
        }

        const allButton = `
            <button type="button" class="project-chip ${this.selectedTechChip ? '' : 'active'}" data-tech="">
                All
            </button>
        `;

        const chipButtons = chips.map(([key, data]) => `
            <button type="button" class="project-chip ${this.selectedTechChip === key ? 'active' : ''}" data-tech="${this.escapeHtml(key)}">
                ${this.escapeHtml(data.label)}
            </button>
        `).join('');

        this.techChips.innerHTML = `${allButton}${chipButtons}`;

        this.techChips.querySelectorAll('.project-chip').forEach((button) => {
            button.addEventListener('click', () => {
                this.selectedTechChip = (button.getAttribute('data-tech') || '').toLowerCase();
                this.applyProjectFilters();
            });
        });
    }

    applyProjectFilters() {
        if (!this.projectsContainer) return;

        if (!this.allProjects.length) {
            this.showEmptyState();
            return;
        }

        const queryInput = (this.searchInput?.value || '').trim();
        const query = queryInput.toLowerCase();
        const status = (this.statusFilter?.value || 'all').toLowerCase();
        const sortValue = (this.sortOrder?.value || 'order-asc').toLowerCase();
        const selectedTech = this.selectedTechChip.toLowerCase();

        const filtered = this.allProjects.filter((project) => {
            const normalizedStatus = this.normalizeStatus(project.status).className;
            if (status !== 'all' && normalizedStatus !== status) {
                return false;
            }

            const technologies = this.normalizeTechnologies(project.technologies);
            const normalizedTechnologies = technologies.map((tech) => tech.toLowerCase());
            if (selectedTech && !normalizedTechnologies.includes(selectedTech)) {
                return false;
            }

            if (!query) return true;

            const haystack = [
                project.title || '',
                project.description || '',
                project.category || '',
                ...technologies
            ].join(' ').toLowerCase();

            return haystack.includes(query);
        });

        const sorted = this.sortProjects(filtered, sortValue);

        if (!sorted.length) {
            this.showEmptyState('No projects match the current filters.', 'No Matching Projects');
            if (this.projectsMeta) this.projectsMeta.textContent = `0 of ${this.allProjects.length} projects`;
            UrlState.set({ q: queryInput, status, sort: sortValue, tech: selectedTech });
            return;
        }

        this.renderProjects(sorted);

        if (this.projectsMeta) {
            const visibleCount = sorted.length;
            const totalCount = this.allProjects.length;
            this.projectsMeta.textContent = visibleCount === totalCount
                ? `${totalCount} projects`
                : `${visibleCount} of ${totalCount} projects`;
        }

        if (this.techChips) {
            this.techChips.querySelectorAll('.project-chip').forEach((chip) => {
                const key = (chip.getAttribute('data-tech') || '').toLowerCase();
                chip.classList.toggle('active', selectedTech ? key === selectedTech : key === '');
            });
        }

        UrlState.set({ q: queryInput, status, sort: sortValue, tech: selectedTech });
    }

    bindTechTagClicks() {
        if (!this.projectsContainer) return;
        // Remove old listener if any
        if (this._techTagHandler) {
            this.projectsContainer.removeEventListener('click', this._techTagHandler);
        }
        this._techTagHandler = (e) => {
            const btn = e.target.closest('.tech-tag-btn');
            if (!btn) return;
            e.stopPropagation();
            const tech = (btn.getAttribute('data-filter-tech') || '').toLowerCase();
            // Toggle: clicking same tag again resets to All
            this.selectedTechChip = this.selectedTechChip === tech ? '' : tech;
            this.applyProjectFilters();
            // Scroll to chips
            this.techChips?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
        this.projectsContainer.addEventListener('click', this._techTagHandler);
    }

    renderProjects(projects) {
        if (!this.projectsContainer) return;

        this.projectsContainer.innerHTML = projects.map((project) => {
            const title = this.escapeHtml(project.title || 'Untitled Project');
            const description = this.escapeHtml(project.description || 'No description provided.');
            const technologies = this.normalizeTechnologies(project.technologies);
            const status = this.normalizeStatus(project.status);
            const link = this.normalizeProjectLink(project.link);
            const icon = this.getIconSVG(project.icon || 'default');

            return `
                <article class="project-card" 
                        data-category="${this.escapeHtml(project.category || 'general')}"
                        data-title="${title}"
                        data-desc="${description}"
                        data-status="${this.escapeHtml(status.label)}"
                        data-status-class="${status.className}"
                        data-tech="${this.escapeHtml(technologies.join(','))}"
                        data-link="${this.escapeHtml(link || '')}"
                        data-icon="${this.escapeHtml(project.icon || 'default')}"
                        role="button"
                        tabindex="0"
                        aria-label="View details for ${title}">
                    <div class="project-card-glow"></div>

                    <div class="card-header">
                        <div class="card-icon-box">${icon}</div>
                        <span class="status-tag ${status.className}">
                            <span class="status-dot"></span>
                            ${this.escapeHtml(status.label)}
                        </span>
                    </div>

                    <h3 class="card-title">${title}</h3>
                    <p class="card-desc">${description}</p>

                    <div class="card-tech">
                        ${(technologies.length ? technologies : ['General']).map((tech) =>
                            `<button type="button" class="tech-tag tech-tag-btn" data-filter-tech="${this.escapeHtml(tech.toLowerCase())}" title="Filter by ${this.escapeHtml(tech)}">${this.escapeHtml(tech)}</button>`
                        ).join('')}
                    </div>

                    ${link ? `
                        <div class="card-footer">
                            <a href="${link}" target="_blank" rel="noopener" class="card-link">
                                <span>View Project</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="7" y1="17" x2="17" y2="7"/>
                                    <polyline points="7 7 17 7 17 17"/>
                                </svg>
                            </a>
                        </div>
                    ` : ''}
                </article>
            `;
        }).join('');

        // Attach click listeners for project detail modal
        this.projectsContainer.querySelectorAll('.project-card').forEach((card) => {
            const open = (event) => {
                if (event?.target instanceof Element && event.target.closest('.tech-tag-btn, .card-link')) {
                    return;
                }
                ProjectModal.open(card, this);
            };
            card.addEventListener('click', open);
            card.addEventListener('keydown', (e) => {
                if (e.target !== card) return;
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); }
            });
            card.querySelector('.card-link')?.addEventListener('click', (e) => e.stopPropagation());
        });

        this.bindTechTagClicks();
    }

    getIconSVG(iconType) {
        const icons = {
            database: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>`,
            hardware: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="6" height="6"/>
                <line x1="9" y1="1" x2="9" y2="4"/>
                <line x1="15" y1="1" x2="15" y2="4"/>
                <line x1="9" y1="20" x2="9" y2="23"/>
                <line x1="15" y1="20" x2="15" y2="23"/>
                <line x1="20" y1="9" x2="23" y2="9"/>
                <line x1="20" y1="14" x2="23" y2="14"/>
                <line x1="1" y1="9" x2="4" y2="9"/>
                <line x1="1" y1="14" x2="4" y2="14"/>
            </svg>`,
            mobile: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>`,
            web: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
            </svg>`,
            default: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>`
        };
        return icons[iconType] || icons.default;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text || '');
        return div.innerHTML;
    }
}

class FirebaseCertificates {
    constructor() {
        this.certList = document.getElementById('certificatesList');
        this.sortOrder = document.getElementById('certificateSortOrder');
        this.certViewer = document.getElementById('certViewer');
        this.certPlaceholder = document.getElementById('certPlaceholder');
        this.certDetails = document.getElementById('certDetails');
        this.certIssuer = document.getElementById('certIssuer');
        this.certDate = document.getElementById('certDate');
        this.viewerTitle = document.getElementById('viewerTitle');
        this.closeViewer = document.getElementById('closeViewer');
        this.zoomBtn = document.getElementById('zoomCertificateBtn');
        this.downloadBtn = document.getElementById('downloadCertificateBtn');

        this.currentCertId = null;
        this.initialCertId = UrlState.get('cert', '');
        this.certificatesById = new Map();
        this.allCertificates = [];
        this.init();
    }

    init() {
        if (!this.certList) return;

        if (typeof db === 'undefined' || !db) {
            console.error('Firebase not initialized');
            this.showError();
            return;
        }

        const initialSort = UrlState.get('certSort', 'order-asc').toLowerCase();
        if (this.sortOrder && [...this.sortOrder.options].some((opt) => opt.value === initialSort)) {
            this.sortOrder.value = initialSort;
        }

        this.showLoading();
        this.bindCertificateControls();
        this.loadCertificates();
        this.setupEventListeners();
    }

    bindCertificateControls() {
        this.sortOrder?.addEventListener('change', () => this.applyCertificateSort());
    }

    setupEventListeners() {
        this.closeViewer?.addEventListener('click', () => this.closeCurrentCertificate());
        this.zoomBtn?.addEventListener('click', () => this.toggleZoom());

        // Click cert image to open lightbox
        this.certViewer?.addEventListener('click', () => {
            const certId = this.certViewer.dataset.certId;
            if (certId && this.certificatesById) {
                CertLightbox.open(this.certificatesById, certId);
            }
        });
    }

    showLoading() {
        this.certList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading certificates...</p>
            </div>
        `;
    }

    showError() {
        this.certList.innerHTML = `
            <div class="error-state">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Failed to load certificates. Please check Firebase configuration.</p>
            </div>
        `;
    }

    showEmptyState() {
        this.certList.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
                <h3>No Certificates Yet</h3>
                <p>Certificates will appear here once added through the admin panel.</p>
            </div>
        `;
    }

    loadCertificates() {
        db.collection(COLLECTIONS.CERTIFICATES)
            .orderBy('order', 'asc')
            .onSnapshot((snapshot) => {
                const certificates = [];
                snapshot.forEach((doc) => certificates.push({ id: doc.id, ...doc.data() }));
                this.allCertificates = certificates;

                if (certificates.length === 0) {
                    this.showEmptyState();
                    this.closeCurrentCertificate();
                } else {
                    this.applyCertificateSort();
                }
            }, (error) => {
                console.error('Error loading certificates:', error);
                this.showError();
            });
    }

    sortCertificates(certificates, sortValue) {
        const list = [...certificates];
        if (sortValue === 'title-asc') {
            list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
            return list;
        }
        if (sortValue === 'title-desc') {
            list.sort((a, b) => String(b.title || '').localeCompare(String(a.title || '')));
            return list;
        }
        if (sortValue === 'time-desc' || sortValue === 'time-asc') {
            const dir = sortValue === 'time-desc' ? -1 : 1;
            list.sort((a, b) => {
                const aTime = getRecordTime(a, ['createdAt', 'updatedAt', 'issueDate', 'date']);
                const bTime = getRecordTime(b, ['createdAt', 'updatedAt', 'issueDate', 'date']);
                if (aTime !== null || bTime !== null) {
                    if (aTime === null) return 1;
                    if (bTime === null) return -1;
                    if (aTime !== bTime) return dir * (aTime - bTime);
                }
                const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
                const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
                if (aOrder !== bOrder) return dir * (aOrder - bOrder);
                return String(a.title || '').localeCompare(String(b.title || ''));
            });
            return list;
        }
        return list;
    }

    applyCertificateSort() {
        if (!this.certList || !this.allCertificates.length) return;
        const sortValue = (this.sortOrder?.value || 'order-asc').toLowerCase();
        const sorted = this.sortCertificates(this.allCertificates, sortValue);
        this.renderCertificates(sorted);
        UrlState.set({ certSort: sortValue });
    }

    renderCertificates(certificates) {
        if (!this.certList) return;

        this.certificatesById = new Map(certificates.map((cert) => [cert.id, cert]));

        this.certList.innerHTML = certificates.map((cert) => {
            const thumb = this.getIssuerLogoMarkup(cert.issuer);

            return `
                <div class="cert-list-item" data-cert-id="${cert.id}" role="option" tabindex="0" aria-selected="false">
                    <div class="cert-thumb" aria-hidden="true">${thumb}</div>
                    <div class="cert-list-info">
                        <div class="cert-list-name">${this.escapeHtml(cert.title || 'Untitled Certificate')}</div>
                        <div class="cert-list-issuer">${this.escapeHtml(cert.issuer || 'Unknown Issuer')}</div>
                    </div>
                </div>
            `;
        }).join('');

        this.certList.querySelectorAll('.cert-list-item').forEach((item) => {
            const selectItem = () => {
                const certId = item.getAttribute('data-cert-id');
                const cert = this.certificatesById.get(certId);
                if (cert) this.viewCertificate(cert);
            };

            item.addEventListener('click', selectItem);
            item.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectItem();
                }
            });
        });

        const initialCertificate = this.currentCertId
            ? this.certificatesById.get(this.currentCertId)
            : (this.initialCertId ? this.certificatesById.get(this.initialCertId) : certificates[0]);

        if (initialCertificate) {
            this.viewCertificate(initialCertificate);
        }
    }

    toggleZoom() {
        if (!this.certViewer || !this.certViewer.classList.contains('visible')) return;
        const isZoomed = this.certViewer.classList.toggle('zoomed');
        if (this.zoomBtn) this.zoomBtn.textContent = isZoomed ? 'Zoom Out' : 'Zoom';
    }

    viewCertificate(cert) {
        const imageUrl = this.normalizeCertificateImagePath(cert.imageUrl);
        const certId = String(cert.id);

        if (this.certList) {
            this.certList.querySelectorAll('.cert-list-item').forEach((item) => {
                const isActive = item.getAttribute('data-cert-id') === certId;
                item.classList.toggle('active', isActive);
                item.setAttribute('aria-selected', String(isActive));
            });
        }

        if (this.viewerTitle) this.viewerTitle.textContent = cert.title || 'Certificate Preview';
        if (this.certIssuer) this.certIssuer.textContent = cert.issuer || '-';
        if (this.certDate) this.certDate.textContent = cert.date || cert.issueDate || '-';

        if (this.certViewer) {
            this.certViewer.classList.remove('zoomed');
        }
        if (this.zoomBtn) {
            this.zoomBtn.textContent = 'Zoom';
            this.zoomBtn.style.display = imageUrl ? 'inline-flex' : 'none';
        }

        if (imageUrl && this.certViewer) {
            this.certViewer.src = imageUrl;
            this.certViewer.classList.add('visible');
            // Store cert data for lightbox
            this.certViewer.dataset.certId = certId;
            if (this.certPlaceholder) this.certPlaceholder.style.display = 'none';

            if (this.downloadBtn) {
                this.downloadBtn.href = imageUrl;
                this.downloadBtn.setAttribute('download', `${(cert.title || 'certificate').replace(/[^\w-]+/g, '_')}.jpg`);
                this.downloadBtn.style.display = 'inline-flex';
            }
        } else if (this.certViewer) {
            this.certViewer.src = '';
            this.certViewer.classList.remove('visible');
            if (this.certPlaceholder) this.certPlaceholder.style.display = 'flex';
            if (this.downloadBtn) this.downloadBtn.style.display = 'none';
        }

        if (this.closeViewer) this.closeViewer.style.display = 'flex';
        if (this.certDetails) this.certDetails.style.display = 'flex';
        this.currentCertId = cert.id;
        UrlState.set({ cert: certId });
    }

    closeCurrentCertificate() {
        if (this.certList) {
            this.certList.querySelectorAll('.cert-list-item').forEach((item) => {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            });
        }

        if (this.certViewer) {
            this.certViewer.classList.remove('visible', 'zoomed');
            this.certViewer.src = '';
        }
        if (this.certPlaceholder) this.certPlaceholder.style.display = 'flex';
        if (this.viewerTitle) this.viewerTitle.textContent = 'Certificate Preview';
        if (this.closeViewer) this.closeViewer.style.display = 'none';
        if (this.certDetails) this.certDetails.style.display = 'none';
        if (this.zoomBtn) {
            this.zoomBtn.textContent = 'Zoom';
            this.zoomBtn.style.display = 'none';
        }
        if (this.downloadBtn) this.downloadBtn.style.display = 'none';

        this.currentCertId = null;
        UrlState.set({ cert: '' });
    }

    normalizeCertificateImagePath(imagePath) {
        if (window.PortfolioUtils?.normalizeCertificateImagePath) {
            return window.PortfolioUtils.normalizeCertificateImagePath(imagePath);
        }
        return String(imagePath || '').trim();
    }

    normalizeIssuerKey(issuer = '') {
        const text = String(issuer || '').toLowerCase();
        if (text.includes('aws')) return 'aws';
        if (text.includes('ibm')) return 'ibm';
        if (text.includes('microsoft')) return 'microsoft';
        if (text.includes('google')) return 'google';
        if (text.includes('simplilearn')) return 'simplilearn';
        if (text.includes('silver oak')) return 'silveroak';
        if (text.includes('coursera')) return 'coursera';
        if (text.includes('udemy')) return 'udemy';
        return 'default';
    }

    getIssuerLogoMarkup(issuer = '') {
        const key = this.normalizeIssuerKey(issuer);
        const labelMap = {
            aws: 'AWS',
            ibm: 'IBM',
            microsoft: 'MS',
            google: 'G',
            simplilearn: 'SL',
            silveroak: 'SOU',
            coursera: 'C',
            udemy: 'U',
            default: 'CERT'
        };

        return `<span class="issuer-logo issuer-${key}">${this.escapeHtml(labelMap[key] || labelMap.default)}</span>`;
    }

    getIconSVG(provider = 'default') {
        const icons = {
            aws: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>`,
            ibm: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 6h24v2H0zM0 10h24v2H0zM0 14h24v2H0z"/>
            </svg>`,
            microsoft: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623"/>
            </svg>`,
            default: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>`
        };
        return icons[(provider || 'default').toLowerCase()] || icons.default;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text || '');
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ViewToggle();
    setTimeout(() => {
        new FirebaseProjects();
        new FirebaseCertificates();
    }, 500);
});

// ── Project Detail Modal ─────────────────────────────────────────
const ProjectModal = {
    overlay: null,
    box: null,

    init() {
        this.overlay = document.getElementById('projectModal');
        if (!this.overlay) return;

        document.getElementById('projectModalClose')?.addEventListener('click', () => this.close());

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    open(card, manager) {
        if (!this.overlay) this.init();
        if (!this.overlay) return;

        const title      = card.dataset.title || '';
        const desc       = card.dataset.desc  || '';
        const statusLabel= card.dataset.status || '';
        const statusClass= card.dataset.statusClass || '';
        const techs      = card.dataset.tech ? card.dataset.tech.split(',').filter(Boolean) : [];
        const link       = card.dataset.link || '';
        const iconType   = card.dataset.icon || 'default';

        document.getElementById('pmodalIcon').innerHTML  = manager.getIconSVG(iconType);
        document.getElementById('pmodalTitle').textContent = title;
        document.getElementById('pmodalDesc').textContent  = desc;

        const statusEl = document.getElementById('pmodalStatus');
        statusEl.className = `pmodal-status status-tag ${statusClass}`;
        statusEl.innerHTML = `<span class="status-dot"></span>${manager.escapeHtml(statusLabel)}`;

        const techEl = document.getElementById('pmodalTech');
        techEl.innerHTML = techs.map(t =>
            `<span class="tech-tag">${manager.escapeHtml(t)}</span>`
        ).join('');

        const actionsEl = document.getElementById('pmodalActions');
        actionsEl.innerHTML = link
            ? `<a href="${manager.escapeHtml(link)}" target="_blank" rel="noopener" class="pmodal-link">
                <span>View Project</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
               </a>`
            : '';

        this.overlay.classList.add('open');
        this.overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    },

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('open');
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
};

// Init modal when DOM ready
document.addEventListener('DOMContentLoaded', () => ProjectModal.init());

// ── Certificate Lightbox ─────────────────────────────────────────
const CertLightbox = {
    overlay: null,
    certsMap: null,
    certIds: [],
    currentIdx: 0,

    init() {
        this.overlay = document.getElementById('certLightbox');
        if (!this.overlay) return;

        document.getElementById('certLightboxClose')?.addEventListener('click', () => this.close());
        document.getElementById('certLightboxPrev')?.addEventListener('click', () => this.navigate(-1));
        document.getElementById('certLightboxNext')?.addEventListener('click', () => this.navigate(1));

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (!this.overlay?.classList.contains('open')) return;
            if (e.key === 'Escape')      this.close();
            if (e.key === 'ArrowLeft')   this.navigate(-1);
            if (e.key === 'ArrowRight')  this.navigate(1);
        });
    },

    open(certsMap, certId) {
        if (!this.overlay) this.init();
        if (!this.overlay) return;

        this.certsMap = certsMap;
        this.certIds  = [...certsMap.keys()];
        this.currentIdx = this.certIds.indexOf(certId);
        if (this.currentIdx === -1) this.currentIdx = 0;

        this.render();
        this.overlay.classList.add('open');
        this.overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    },

    render() {
        const id   = this.certIds[this.currentIdx];
        const cert = this.certsMap.get(id);
        if (!cert) return;

        const img = document.getElementById('certLightboxImg');
        const imageUrl = window.PortfolioUtils?.normalizeCertificateImagePath
            ? window.PortfolioUtils.normalizeCertificateImagePath(cert.imageUrl)
            : String(cert.imageUrl || '').trim();
        img.src = imageUrl;
        img.alt = cert.title || 'Certificate';
        document.getElementById('certLightboxTitle').textContent  = cert.title  || '';
        document.getElementById('certLightboxIssuer').textContent = cert.issuer || '';

        // Show/hide nav arrows
        const prev = document.getElementById('certLightboxPrev');
        const next = document.getElementById('certLightboxNext');
        prev.style.visibility = this.currentIdx > 0 ? 'visible' : 'hidden';
        next.style.visibility = this.currentIdx < this.certIds.length - 1 ? 'visible' : 'hidden';
    },

    navigate(dir) {
        const newIdx = this.currentIdx + dir;
        if (newIdx < 0 || newIdx >= this.certIds.length) return;
        this.currentIdx = newIdx;
        this.render();
    },

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('open');
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
};

document.addEventListener('DOMContentLoaded', () => CertLightbox.init());
