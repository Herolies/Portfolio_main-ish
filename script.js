/* ═══════════════════════════════════════════════════
   ANDRES ROJAS — PORTFOLIO
   JavaScript — Theme, Navigation, Animations
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── DOM Elements ──────────────────────────────
    const html = document.documentElement;
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    const allNavLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section, .hero');

    // ═══════════════════════════════════════════════
    // THEME MANAGEMENT
    // ═══════════════════════════════════════════════

    const THEME_KEY = 'ar-portfolio-theme';

    /**
     * Get the user's preferred theme.
     * Priority: localStorage > system preference > light
     */
    function getPreferredTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'dark' || stored === 'light') return stored;

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * Apply a theme to the document.
     */
    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * Toggle between light and dark themes.
     */
    function toggleTheme() {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }

    // Initialize theme immediately (no flash of wrong theme)
    setTheme(getPreferredTheme());

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem(THEME_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // ═══════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════

    /**
     * Handle scroll-based nav styling.
     */
    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Add/remove scrolled class for shadow
                if (scrollY > 20) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                lastScroll = scrollY;
                ticking = false;
            });
            ticking = true;
        }
    }

    /**
     * Toggle mobile menu.
     */
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');

        // Prevent body scroll when menu is open
        if (navLinks.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * Close mobile menu.
     */
    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ═══════════════════════════════════════════════
    // ACTIVE SECTION TRACKING
    // ═══════════════════════════════════════════════

    /**
     * Use Intersection Observer to highlight the active nav link
     * based on which section is currently in view.
     */
    function setupActiveSection() {
        const observerOptions = {
            root: null,
            rootMargin: `-${parseInt(getComputedStyle(html).getPropertyValue('--nav-height')) || 72}px 0px -40% 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');

                    allNavLinks.forEach((link) => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach((section) => {
            observer.observe(section);
        });
    }

    // ═══════════════════════════════════════════════
    // SMOOTH SCROLL FOR NAV LINKS
    // ═══════════════════════════════════════════════

    function setupSmoothScroll() {
        allNavLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const navHeight = parseInt(getComputedStyle(html).getPropertyValue('--nav-height')) || 72;
                        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }

                // Close mobile menu after clicking
                closeMobileMenu();
            });
        });
    }

    // ═══════════════════════════════════════════════
    // SCROLL-TRIGGERED ANIMATIONS
    // ═══════════════════════════════════════════════

    function setupScrollAnimations() {
        const revealElements = document.querySelectorAll('[data-reveal]');

        if (revealElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1
        });

        revealElements.forEach((el) => observer.observe(el));
    }

    // ═══════════════════════════════════════════════
    // LIGHTBOX / GALLERY
    // ═══════════════════════════════════════════════

    function setupLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCategory = document.getElementById('lightbox-category');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxCounter = document.getElementById('lightbox-counter');
        const closeBtn = document.getElementById('lightbox-close');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');

        if (!lightbox || galleryItems.length === 0) return;

        let currentIndex = 0;

        // Build photo data from DOM
        const photos = Array.from(galleryItems).map((item) => {
            const img = item.querySelector('.gallery-img');
            const category = item.querySelector('.gallery-category');
            const caption = item.querySelector('.gallery-caption');
            return {
                src: img ? img.src : '',
                alt: img ? img.alt : '',
                category: category ? category.textContent : '',
                caption: caption ? caption.textContent : ''
            };
        });

        function showPhoto(index) {
            currentIndex = index;
            const photo = photos[index];

            // Brief opacity transition for image swap
            lightboxImg.style.opacity = '0';
            lightboxImg.style.transform = 'scale(0.9)';

            setTimeout(() => {
                lightboxImg.src = photo.src;
                lightboxImg.alt = photo.alt;
                lightboxCategory.textContent = photo.category;
                lightboxCaption.textContent = photo.caption;
                lightboxCounter.textContent = (index + 1) + ' / ' + photos.length;

                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            }, 150);
        }

        function openLightbox(index) {
            showPhoto(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function nextPhoto() {
            showPhoto((currentIndex + 1) % photos.length);
        }

        function prevPhoto() {
            showPhoto((currentIndex - 1 + photos.length) % photos.length);
        }

        // Click gallery items to open
        galleryItems.forEach((item) => {
            item.addEventListener('click', () => {
                const index = parseInt(item.getAttribute('data-index'), 10);
                openLightbox(index);
            });
        });

        // Close
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Navigation
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextPhoto();
        });
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevPhoto();
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
        });
    }

    // ═══════════════════════════════════════════════
    // CONTACT FORM VALIDATION
    // ═══════════════════════════════════════════════

    function setupContactForm() {
        const form = document.getElementById('contact-form');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const successMsg = document.getElementById('form-success');

        if (!form) return;

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function validateField(input, validationFn) {
            const group = input.parentElement;
            if (!validationFn(input.value.trim())) {
                group.classList.add('error');
                return false;
            } else {
                group.classList.remove('error');
                return true;
            }
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const isNameValid = validateField(nameInput, val => val !== '');
            const isEmailValid = validateField(emailInput, isValidEmail);
            const isMessageValid = validateField(messageInput, val => val !== '');

            if (isNameValid && isEmailValid && isMessageValid) {
                // Simulate form submission
                const submitBtn = form.querySelector('.btn-submit span');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                form.querySelector('.btn-submit').style.opacity = '0.7';
                form.querySelector('.btn-submit').style.pointerEvents = 'none';

                setTimeout(() => {
                    // Reset form state
                    submitBtn.textContent = originalText;
                    form.querySelector('.btn-submit').style.opacity = '1';
                    form.querySelector('.btn-submit').style.pointerEvents = 'auto';
                    
                    form.reset();
                    
                    // Show success
                    successMsg.classList.add('show');
                    
                    // Hide success after 5 seconds
                    setTimeout(() => {
                        successMsg.classList.remove('show');
                    }, 5000);
                }, 1200);
            }
        });

        // Clear error on input
        [nameInput, emailInput, messageInput].forEach(input => {
            input.addEventListener('input', () => {
                input.parentElement.classList.remove('error');
            });
        });
    }

    // ═══════════════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════════════

    function init() {
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);

        // Scroll handler
        window.addEventListener('scroll', onScroll, { passive: true });

        // Mobile menu
        hamburger.addEventListener('click', toggleMobileMenu);

        // Close mobile menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });

        // Setup observers and scroll behavior
        setupActiveSection();
        setupSmoothScroll();
        setupScrollAnimations();
        setupLightbox();
        setupContactForm();

        // Initial scroll check (in case page loads scrolled)
        onScroll();
    }

    // ─── Initialize ────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
