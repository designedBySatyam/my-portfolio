'use strict';

(() => {
  // ─── Rate limit config ───────────────────────────────────────
  const RATE_LIMIT = {
    key: 'cf_submissions',
    max: 3,          // max submissions
    windowMs: 60 * 60 * 1000  // per hour
  };

  function getRateLimitData() {
    try {
      return JSON.parse(localStorage.getItem(RATE_LIMIT.key) || '{"timestamps":[]}');
    } catch {
      return { timestamps: [] };
    }
  }

  function isRateLimited() {
    const now = Date.now();
    const data = getRateLimitData();
    // Keep only timestamps within the window
    const recent = data.timestamps.filter(t => now - t < RATE_LIMIT.windowMs);
    return recent.length >= RATE_LIMIT.max;
  }

  function recordSubmission() {
    const now = Date.now();
    const data = getRateLimitData();
    const recent = data.timestamps.filter(t => now - t < RATE_LIMIT.windowMs);
    recent.push(now);
    try {
      localStorage.setItem(RATE_LIMIT.key, JSON.stringify({ timestamps: recent }));
    } catch {
      // localStorage unavailable — fail open (still send)
    }
  }

  function minutesUntilReset() {
    const now = Date.now();
    const data = getRateLimitData();
    const recent = data.timestamps.filter(t => now - t < RATE_LIMIT.windowMs);
    if (!recent.length) return 0;
    const oldest = Math.min(...recent);
    return Math.ceil((RATE_LIMIT.windowMs - (now - oldest)) / 60000);
  }

  // ─── URL detection in text ───────────────────────────────────
  function containsUrl(text) {
    return /https?:\/\/|www\.|\.com|\.net|\.org|\.io/i.test(text);
  }

  // ─── Main class ──────────────────────────────────────────────
  class ContactForm {
    constructor() {
      this.form       = document.getElementById('contactForm');
      this.submitBtn  = this.form?.querySelector('.submit-btn');
      this.submitText = this.submitBtn?.querySelector('.btn-text');
      this.statusEl   = document.getElementById('formStatus');
      this.honeypot   = this.form?.querySelector('[name="website"]');
      this.textarea   = this.form?.querySelector('#message');
      this.counter    = document.getElementById('charCounter');
      this.socialCards = document.querySelectorAll('.social-card');

      this.emailConfig = {
        serviceId:  this.form?.dataset?.serviceId  || 'service_hvoqys3',
        templateId: this.form?.dataset?.templateId || 'template_guin48a',
        publicKey:  this.form?.dataset?.publicKey  || 'ERcS2hOvR_hVjIE4G'
      };
    }

    init() {
      if (!this.form) return;

      if (typeof emailjs === 'undefined') {
        this.showStatus('error', 'Email service is unavailable right now.');
        return;
      }

      emailjs.init(this.emailConfig.publicKey);
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      this.initCharCounter();
      this.initSocialReveal();
    }

    initCharCounter() {
      if (!this.textarea || !this.counter) return;
      const max = parseInt(this.textarea.getAttribute('maxlength'), 10) || 2000;

      const update = () => {
        const len = this.textarea.value.length;
        this.counter.textContent = `${len} / ${max}`;
        this.counter.classList.toggle('near-limit', len > max * 0.85);
        this.counter.classList.toggle('at-limit',   len >= max);
      };

      this.textarea.addEventListener('input', update);
      update();
    }

    initSocialReveal() {
      if (!this.socialCards.length) return;
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.25 });
      this.socialCards.forEach(card => observer.observe(card));
    }

    validate() {
      const name    = this.form.user_name?.value?.trim()  || '';
      const email   = this.form.user_email?.value?.trim() || '';
      const message = this.form.message?.value?.trim()    || '';

      if (!name || !email || !message) {
        return 'Please fill in all required fields.';
      }

      if (name.length < 2) {
        return 'Name must be at least 2 characters.';
      }

      if (containsUrl(name)) {
        return 'Name cannot contain links.';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return 'Please enter a valid email address.';
      }

      if (message.length < 10) {
        return 'Message must be at least 10 characters long.';
      }

      if (message.length > 2000) {
        return 'Message must be under 2000 characters.';
      }

      return '';
    }

    setLoadingState(isLoading) {
      if (!this.submitBtn || !this.submitText) return;
      this.submitBtn.disabled = isLoading;
      this.submitBtn.classList.toggle('loading', isLoading);
      this.submitText.textContent = isLoading ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE';
    }

    showStatus(type, message) {
      if (!this.statusEl) return;
      this.statusEl.className = `form-status ${type}`;
      this.statusEl.textContent = message;
      this.statusEl.style.display = 'block';
      // Auto-clear success after 8s
      if (type === 'success') {
        setTimeout(() => this.clearStatus(), 8000);
      }
    }

    clearStatus() {
      if (!this.statusEl) return;
      this.statusEl.className = 'form-status';
      this.statusEl.textContent = '';
      this.statusEl.style.display = 'none';
    }

    async handleSubmit(event) {
      event.preventDefault();

      // 1. Honeypot check — silent drop
      if (this.honeypot?.value) {
        this.form.reset();
        this.showStatus('success', 'Message sent successfully. I will get back to you within 24 hours.');
        return;
      }

      // 2. Rate limit check
      if (isRateLimited()) {
        const mins = minutesUntilReset();
        this.showStatus('error', `Too many messages sent. Please wait ${mins} minute${mins !== 1 ? 's' : ''} before trying again.`);
        return;
      }

      // 3. Field validation
      const validationError = this.validate();
      if (validationError) {
        this.showStatus('error', validationError);
        return;
      }

      this.clearStatus();
      this.setLoadingState(true);

      const templateParams = {
        user_name:  this.form.user_name.value.trim(),
        user_email: this.form.user_email.value.trim(),
        message:    this.form.message.value.trim(),
        title:      'New Contact Form Submission'
      };

      try {
        await emailjs.send(
          this.emailConfig.serviceId,
          this.emailConfig.templateId,
          templateParams
        );
        recordSubmission();
        this.form.reset();
        if (this.counter) this.counter.textContent = '0 / 2000';
        this.showStatus('success', 'Message sent successfully. I will get back to you within 24 hours.');
      } catch (error) {
        console.error('Contact form send failed:', error);
        this.showStatus('error', 'Message could not be sent. Please try again in a moment.');
      } finally {
        this.setLoadingState(false);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new ContactForm().init();
  });
})();