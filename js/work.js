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

    normalizeCategory(value) {
        const raw = String(value || 'general').trim().toLowerCase();
        const map = {
            web: 'web',
            'web development': 'web',
            frontend: 'web',
            app: 'app',
            mobile: 'app',
            'mobile app': 'app',
            ai: 'ai',
            'artificial intelligence': 'ai',
            ml: 'ml',
            'machine learning': 'ml',
            database: 'database',
            data: 'database',
            hardware: 'hardware',
            iot: 'hardware',
            optimization: 'optimization',
            performance: 'optimization',
            devops: 'devops',
            cloud: 'devops',
            general: 'general',
            default: 'general'
        };
        return map[raw] || 'general';
    }

    normalizeIconType(value) {
        const raw = String(value || '').trim().toLowerCase();
        const map = {
            web: 'web',
            code: 'web',
            app: 'app',
            mobile: 'app',
            phone: 'app',
            ai: 'ai',
            ml: 'ml',
            database: 'database',
            hardware: 'hardware',
            optimization: 'optimization',
            devops: 'devops',
            general: 'general',
            default: 'general',
            box: 'general'
        };
        return map[raw] || '';
    }

    getDefaultIconForCategory(categoryKey) {
        const map = {
            web: 'web',
            app: 'app',
            ai: 'ai',
            ml: 'ml',
            database: 'database',
            hardware: 'hardware',
            optimization: 'optimization',
            devops: 'devops',
            general: 'general'
        };
        return map[categoryKey] || 'general';
    }

    resolveProjectVisual(project) {
        const categoryKey = this.normalizeCategory(project.category);
        const explicitIcon = this.normalizeIconType(project.icon);
        const iconKey = explicitIcon || this.getDefaultIconForCategory(categoryKey);
        return { categoryKey, iconKey };
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
            const visual = this.resolveProjectVisual(project);
            const icon = this.getIconSVG(visual.iconKey);

            return `
                <article class="project-card" 
                        data-category="${this.escapeHtml(project.category || 'general')}"
                        data-category-key="${this.escapeHtml(visual.categoryKey)}"
                        data-title="${title}"
                        data-desc="${description}"
                        data-status="${this.escapeHtml(status.label)}"
                        data-status-class="${status.className}"
                        data-tech="${this.escapeHtml(technologies.join(','))}"
                        data-link="${this.escapeHtml(link || '')}"
                        data-icon="${this.escapeHtml(visual.iconKey)}"
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
            web: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="14" rx="2"/>
                <line x1="3" y1="8" x2="21" y2="8"/>
                <polyline points="10 12 8 14 10 16"/>
                <polyline points="14 12 16 14 14 16"/>
            </svg>`,
            app: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="7" y="2.5" width="10" height="19" rx="2.2"/>
                <circle cx="10.2" cy="8.6" r="0.8" fill="currentColor" stroke="none"/>
                <circle cx="13.8" cy="8.6" r="0.8" fill="currentColor" stroke="none"/>
                <circle cx="10.2" cy="12" r="0.8" fill="currentColor" stroke="none"/>
                <circle cx="13.8" cy="12" r="0.8" fill="currentColor" stroke="none"/>
                <line x1="10.5" y1="18" x2="13.5" y2="18"/>
            </svg>`,
            ai: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l1.7 3.5L17 8.2l-3.3 1.7L12 13.4l-1.7-3.5L7 8.2l3.3-1.7L12 3z"/>
                <circle cx="7.5" cy="16.5" r="1.5"/>
                <circle cx="12" cy="18.5" r="1.5"/>
                <circle cx="16.5" cy="16.5" r="1.5"/>
                <line x1="8.8" y1="15.6" x2="10.7" y2="17.3"/>
                <line x1="13.3" y1="17.3" x2="15.2" y2="15.6"/>
            </svg>`,
            ml: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 16 9 11 13 14 20 7"/>
                <circle cx="4" cy="16" r="1.4"/>
                <circle cx="9" cy="11" r="1.4"/>
                <circle cx="13" cy="14" r="1.4"/>
                <circle cx="20" cy="7" r="1.4"/>
                <path d="M4 20h16"/>
            </svg>`,
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
            optimization: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 16a7 7 0 0 1 14 0"/>
                <line x1="12" y1="16" x2="16.2" y2="11.8"/>
                <circle cx="12" cy="16" r="1.5"/>
            </svg>`,
            devops: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="4" width="16" height="6" rx="1.5"/>
                <rect x="4" y="14" width="16" height="6" rx="1.5"/>
                <line x1="8" y1="7" x2="8.01" y2="7"/>
                <line x1="8" y1="17" x2="8.01" y2="17"/>
                <path d="M12 10v4"/>
            </svg>`,
            general: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>`
        };
        const key = this.normalizeIconType(iconType) || 'general';
        return icons[key] || icons.general;
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
            const thumb = this.getIssuerLogoMarkup(cert);

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

    normalizeIssuerKey(issuer = '', title = '') {
        const text = `${String(issuer || '')} ${String(title || '')}`.toLowerCase();

        const companyMatchers = [
            { key: 'aws', terms: ['aws', 'amazon web services', 'aws academy'] },
            { key: 'ibm', terms: ['ibm'] },
            { key: 'google', terms: ['google', 'gcp', 'google cloud'] },
            { key: 'microsoft', terms: ['microsoft', 'azure', 'az-'] },
            { key: 'oracle', terms: ['oracle', 'oci'] },
            { key: 'cisco', terms: ['cisco', 'ccna', 'ccnp'] },
            { key: 'meta', terms: ['meta'] },
            { key: 'adobe', terms: ['adobe'] },
            { key: 'intel', terms: ['intel'] },
            { key: 'coursera', terms: ['coursera'] },
            { key: 'udemy', terms: ['udemy'] },
            { key: 'simplilearn', terms: ['simplilearn'] },
            { key: 'silveroak', terms: ['silver oak'] },
            { key: 'nptel', terms: ['nptel', 'iit', 'swayam'] }
        ];

        for (const matcher of companyMatchers) {
            if (matcher.terms.some((term) => text.includes(term))) {
                return matcher.key;
            }
        }

        if (/(cloud|devops|kubernetes|docker|terraform|serverless)/.test(text)) return 'cloud';
        if (/(ai|artificial intelligence|machine learning|deep learning|neural|llm|nlp)/.test(text)) return 'ai';
        if (/(security|cyber|ethical hacking|penetration|soc|forensics)/.test(text)) return 'security';
        if (/(data|analytics|sql|database|power bi|tableau|excel)/.test(text)) return 'data';
        if (/(web|frontend|backend|javascript|react|node|api|html|css)/.test(text)) return 'code';
        if (/(academy|university|institute|college|school|education)/.test(text)) return 'academic';

        return 'default';
    }

    getIssuerMonogram(issuer = '', title = '') {
        const source = String(issuer || title || 'CERT')
            .replace(/[^a-zA-Z0-9 ]+/g, ' ')
            .trim();
        if (!source) return 'CRT';
        const parts = source.split(/\s+/).filter(Boolean);
        if (!parts.length) return 'CRT';
        if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
        return parts.slice(0, 3).map((part) => part.charAt(0)).join('').toUpperCase();
    }

    getIssuerLogoMarkup(cert = {}) {
        const issuer = cert?.issuer || '';
        const title = cert?.title || '';
        const key = this.normalizeIssuerKey(issuer, title);
        const monogram = this.getIssuerMonogram(issuer, title);
        const useMonogram = key === 'default';
        const content = useMonogram
            ? `<span class="issuer-logo-text">${this.escapeHtml(monogram)}</span>`
            : `<span class="issuer-logo-icon" aria-hidden="true">${this.getCertificateIconSVG(key)}</span>`;

        return `<span class="issuer-logo issuer-${key}" title="${this.escapeHtml(issuer || title || 'Certificate')}">${content}</span>`;
    }

    getCertificateIconSVG(provider = 'default') {
        const icons = {
            aws: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M3 17.5c1.8 1.3 4.4 2 7.4 2 3.1 0 5.9-.8 7.8-2.3"/>
                <path d="M7 15.5c-1.8 0-3.2-1.4-3.2-3.1 0-1.6 1.2-2.9 2.7-3.1.4-2.8 2.8-4.9 5.7-4.9 3.1 0 5.7 2.5 5.7 5.6v.3c1.2.5 2 1.7 2 3.1 0 1.9-1.6 3.5-3.5 3.5H7Z"/>
            </svg>`,
            ibm: `<svg viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="7" x2="20" y2="7"/>
                <line x1="4" y1="10" x2="20" y2="10"/>
                <line x1="4" y1="13" x2="20" y2="13"/>
                <line x1="4" y1="16" x2="20" y2="16"/>
                <line x1="8" y1="6" x2="8" y2="17"/>
                <line x1="16" y1="6" x2="16" y2="17"/>
            </svg>`,
            google: `<svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7"/>
                <path d="M12 8v4h4"/>
            </svg>`,
            microsoft: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="7" height="7" rx="1"/>
                <rect x="13" y="4" width="7" height="7" rx="1"/>
                <rect x="4" y="13" width="7" height="7" rx="1"/>
                <rect x="13" y="13" width="7" height="7" rx="1"/>
            </svg>`,
            oracle: `<svg viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="7" rx="6.5" ry="2.6"/>
                <path d="M5.5 7v7c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6V7"/>
                <path d="M5.5 10.4c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6"/>
            </svg>`,
            cisco: `<svg viewBox="0 0 24 24" fill="none">
                <line x1="5" y1="14" x2="5" y2="10"/>
                <line x1="8" y1="16" x2="8" y2="8"/>
                <line x1="11" y1="18" x2="11" y2="6"/>
                <line x1="14" y1="18" x2="14" y2="6"/>
                <line x1="17" y1="16" x2="17" y2="8"/>
                <line x1="20" y1="14" x2="20" y2="10"/>
            </svg>`,
            meta: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M3 14c1.8-5.6 3.9-8 6.3-8 2.2 0 3 2.2 2.7 5.4C11.7 8.2 12.5 6 14.7 6c2.4 0 4.5 2.4 6.3 8"/>
                <path d="M3 14c1.8 5.6 3.9 8 6.3 8 2.2 0 3-2.2 2.7-5.4-.3 3.2.5 5.4 2.7 5.4 2.4 0 4.5-2.4 6.3-8"/>
            </svg>`,
            adobe: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M4 20L11.2 4h1.6L20 20"/>
                <path d="M8.2 14h7.6"/>
            </svg>`,
            intel: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="7" y="7" width="10" height="10" rx="2"/>
                <line x1="12" y1="3" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="21"/>
                <line x1="3" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="21" y2="12"/>
                <line x1="5.6" y1="5.6" x2="7" y2="7"/>
                <line x1="17" y1="17" x2="18.4" y2="18.4"/>
            </svg>`,
            coursera: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 5l9 4.5-9 4.5-9-4.5Z"/>
                <path d="M6 12v3.5c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V12"/>
            </svg>`,
            udemy: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M12 5v11"/>
                <path d="M8 12l4 4 4-4"/>
                <path d="M5 19h14"/>
            </svg>`,
            simplilearn: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 5l9 4.5-9 4.5-9-4.5Z"/>
                <path d="M6 12v3.5c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V12"/>
            </svg>`,
            silveroak: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 5l9 4.5-9 4.5-9-4.5Z"/>
                <path d="M6 12v3.5c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V12"/>
            </svg>`,
            nptel: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 5l9 4.5-9 4.5-9-4.5Z"/>
                <path d="M6 12v3.5c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V12"/>
            </svg>`,
            cloud: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M7 17.5h10.2c2.1 0 3.8-1.7 3.8-3.8 0-2-1.5-3.6-3.5-3.8A5.6 5.6 0 0 0 7 8.9a4.2 4.2 0 0 0 0 8.6Z"/>
            </svg>`,
            ai: `<svg viewBox="0 0 24 24" fill="none">
                <rect x="7" y="7" width="10" height="10" rx="2"/>
                <path d="M12 4v3M12 17v3M4 12h3M17 12h3M7 7 5.5 5.5M17 7l1.5-1.5M7 17l-1.5 1.5M17 17l1.5 1.5"/>
                <circle cx="12" cy="12" r="2.3"/>
            </svg>`,
            security: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3 5 6.2v5.1c0 4.3 2.9 7.9 7 9.4 4.1-1.5 7-5.1 7-9.4V6.2L12 3Z"/>
                <path d="m9 12.4 2 2 4-4"/>
            </svg>`,
            data: `<svg viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="7" rx="6.5" ry="2.6"/>
                <path d="M5.5 7v9c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6V7"/>
                <path d="M5.5 11c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6"/>
            </svg>`,
            code: `<svg viewBox="0 0 24 24" fill="none">
                <polyline points="8 7 3 12 8 17"/>
                <polyline points="16 7 21 12 16 17"/>
                <line x1="13" y1="5" x2="11" y2="19"/>
            </svg>`,
            academic: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 5l9 4.5-9 4.5-9-4.5Z"/>
                <path d="M6 12v3.5c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V12"/>
            </svg>`,
            default: `<svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>`
        };
        return icons[(provider || 'default').toLowerCase()] || icons.default;
    }

    // Backward-compatible alias
    getIconSVG(provider = 'default') {
        return this.getCertificateIconSVG(provider);
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
        const iconType   = card.dataset.icon || 'general';
        const categoryKey = card.dataset.categoryKey || 'general';

        const modalIcon = document.getElementById('pmodalIcon');
        modalIcon.innerHTML = manager.getIconSVG(iconType);
        modalIcon.setAttribute('data-category-key', categoryKey);
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
