/* =====================================================
   SUMMERVILLE NURSERY - Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initMobileMenu();
    initHeaderScroll();
    initHeroSlider();
    initTestimonialCarousel();
    initProductTabs();
    initLightbox();
    initScrollAnimations();
    initContactForm();
    initFAQAccordion();
});

/* =====================================================
   MOBILE MENU
   ===================================================== */
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }
}

/* =====================================================
   HEADER SCROLL EFFECT
   ===================================================== */
function initHeaderScroll() {
    const header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

/* =====================================================
   HERO SLIDER
   ===================================================== */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');

    if (slides.length > 0) {
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        // Auto advance slides
        setInterval(nextSlide, 5000);

        // Initialize first slide
        showSlide(0);
    }
}

/* =====================================================
   TESTIMONIAL CAROUSEL - Smooth Auto-scroll
   ===================================================== */
function initTestimonialCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.testimonial-track');
    const cards = carousel.querySelectorAll('.testimonial-card');
    const prevBtn = carousel.querySelector('.prev-btn');
    const nextBtn = carousel.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!track || cards.length === 0) return;

    let currentIndex = 0;
    let autoScrollTimer = null;
    let isAnimating = false;
    let cardsToShow = getCardsToShow();
    const AUTO_SCROLL_DELAY = 4000;
    const ANIMATION_DURATION = 600;

    // Calculate cards to show based on screen width
    function getCardsToShow() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    // Get max index
    function getMaxIndex() {
        return Math.max(0, cards.length - cardsToShow);
    }

    // Create navigation dots
    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const totalSlides = getMaxIndex() + 1;
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => {
                if (!isAnimating) goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    // Update dots
    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // Smooth slide to position
    function slideTo(index, smooth = true) {
        if (isAnimating) return;
        
        const maxIndex = getMaxIndex();
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        
        if (smooth) {
            isAnimating = true;
            track.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        } else {
            track.style.transition = 'none';
        }
        
        // Calculate offset based on card width including gap
        const trackWrapper = carousel.querySelector('.testimonial-track-wrapper');
        const cardElement = cards[0];
        if (cardElement && trackWrapper) {
            const cardWidth = cardElement.offsetWidth + 20; // 20px is the gap
            const offset = currentIndex * cardWidth;
            track.style.transform = `translateX(-${offset}px)`;
        }
        
        updateDots();
        
        if (smooth) {
            setTimeout(() => {
                isAnimating = false;
            }, ANIMATION_DURATION);
        }
    }

    // Go to specific slide
    function goToSlide(index) {
        slideTo(index);
        restartAutoScroll();
    }

    // Next slide
    function nextSlide() {
        const maxIndex = getMaxIndex();
        const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        slideTo(nextIndex);
    }

    // Previous slide
    function prevSlide() {
        const maxIndex = getMaxIndex();
        const prevIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        slideTo(prevIndex);
    }

    // Auto scroll controls
    function startAutoScroll() {
        stopAutoScroll();
        autoScrollTimer = setTimeout(function autoAdvance() {
            if (!isAnimating) {
                nextSlide();
            }
            autoScrollTimer = setTimeout(autoAdvance, AUTO_SCROLL_DELAY);
        }, AUTO_SCROLL_DELAY);
    }

    function stopAutoScroll() {
        if (autoScrollTimer) {
            clearTimeout(autoScrollTimer);
            autoScrollTimer = null;
        }
    }

    function restartAutoScroll() {
        stopAutoScroll();
        startAutoScroll();
    }

    // Button events with debounce protection
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isAnimating) {
                prevSlide();
                restartAutoScroll();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isAnimating) {
                nextSlide();
                restartAutoScroll();
            }
        });
    }

    // Pause on hover/focus
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);
    carousel.addEventListener('focusin', stopAutoScroll);
    carousel.addEventListener('focusout', startAutoScroll);

    // Touch/Swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    carousel.addEventListener('touchstart', (e) => {
        if (isAnimating) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = true;
        stopAutoScroll();
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const diffX = Math.abs(touchX - touchStartX);
        const diffY = Math.abs(touchY - touchStartY);
        
        // If vertical scroll is greater, cancel swipe
        if (diffY > diffX) {
            isSwiping = false;
        }
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        if (!isSwiping || isAnimating) {
            startAutoScroll();
            return;
        }
        
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        isSwiping = false;
        startAutoScroll();
    }, { passive: true });

    // Handle resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newCardsToShow = getCardsToShow();
            if (newCardsToShow !== cardsToShow) {
                cardsToShow = newCardsToShow;
                currentIndex = Math.min(currentIndex, getMaxIndex());
                createDots();
                slideTo(currentIndex, false);
            }
        }, 150);
    });

    // Initialize
    createDots();
    slideTo(0, false);
    startAutoScroll();
}

/* =====================================================
   PRODUCT TABS
   ===================================================== */
function initProductTabs() {
    const tabs = document.querySelectorAll('.product-tab');
    const products = document.querySelectorAll('.product-card');

    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');

                const category = this.getAttribute('data-category');

                // Filter products
                products.forEach(product => {
                    if (category === 'all' || product.getAttribute('data-category') === category) {
                        product.style.display = 'block';
                        product.style.animation = 'fadeInUp 0.5s ease forwards';
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        });
    }
}

/* =====================================================
   LIGHTBOX
   ===================================================== */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (galleryItems.length > 0 && lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function () {
                const img = this.querySelector('img');
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
}

/* =====================================================
   SCROLL ANIMATIONS
   ===================================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }
}

/* =====================================================
   CONTACT FORM
   ===================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Basic validation
            if (!data.name || !data.email || !data.message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
}

/* =====================================================
   NOTIFICATION SYSTEM
   ===================================================== */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/* =====================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* =====================================================
   LAZY LOADING IMAGES
   ===================================================== */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', initLazyLoading);

/* =====================================================
   BACK TO TOP BUTTON
   ===================================================== */
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color, #2d5a27);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize back to top
document.addEventListener('DOMContentLoaded', initBackToTop);

/* =====================================================
   FAQ ACCORDION
   ===================================================== */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            // Close all others
            faqItems.forEach(other => {
                const otherBtn = other.querySelector('.faq-question');
                const otherAnswer = other.querySelector('.faq-answer');
                if (otherBtn && otherAnswer) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    otherAnswer.classList.remove('open');
                }
            });

            // Toggle current
            if (!isOpen) {
                btn.setAttribute('aria-expanded', 'true');
                answer.classList.add('open');
            }
        });
    });
}
