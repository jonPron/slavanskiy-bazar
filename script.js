const smoothScrollTo = (target, offset = 80) => {
  const element = document.querySelector(target);
  if (!element) return;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
};

const debounce = (func, wait = 100) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const isInViewport = (element, offset = 100) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.bottom >= offset
  );
};

class Navigation {
  constructor() {
    this.header = document.querySelector('.header');
    this.navToggle = document.querySelector('.nav__toggle');
    this.navMenu = document.querySelector('.nav__menu');
    this.navOverlay = document.querySelector('.nav__overlay');
    this.navLinks = document.querySelectorAll('.nav__link');
    this.init();
  }

  init() {
    this.handleScroll();
    this.handleMobileMenu();
    this.handleSmoothScroll();
    window.addEventListener('scroll', debounce(() => this.handleScroll(), 50));
  }

  handleScroll() {
    if (window.scrollY > 100) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
  }

  handleMobileMenu() {
    if (!this.navToggle || !this.navMenu) return;

    // Открытие/закрытие меню
    this.navToggle.addEventListener('click', () => {
      const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
      this.navToggle.setAttribute('aria-expanded', !isExpanded);
      this.navMenu.classList.toggle('active');
      if (this.navOverlay) {
        this.navOverlay.classList.toggle('active');
      }
      // Блокировка прокрутки при открытом меню
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Закрытие при клике на ссылку
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    // Закрытие при клике на оверлей
    if (this.navOverlay) {
      this.navOverlay.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav')) {
        this.closeMenu();
      }
    });
  }

  closeMenu() {
    this.navMenu.classList.remove('active');
    this.navToggle.setAttribute('aria-expanded', 'false');
    if (this.navOverlay) {
      this.navOverlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  handleSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          smoothScrollTo(targetId);
        }
      });
    });
  }
}

class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('[data-animation]');
    this.init();
  }

  init() {
    this.checkElements();
    window.addEventListener('scroll', debounce(() => this.checkElements(), 100));
  }

  checkElements() {
    this.elements.forEach(element => {
      if (isInViewport(element, 100) && !element.classList.contains('animated')) {
        element.classList.add('animated');
      }
    });
  }
}

class AudioPlayer {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.audio = this.container.querySelector('.audio-player__element');
    this.playButton = this.container.querySelector('.audio-player__button');
    this.progressBar = this.container.querySelector('.audio-player__progress-bar');
    this.durationElement = this.container.querySelector('.audio-player__duration');

    this.init();
  }

  init() {
    if (!this.audio || !this.playButton) return;

    this.playButton.addEventListener('click', () => this.togglePlay());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audio.addEventListener('ended', () => this.handleEnd());
    this.audio.addEventListener('error', () => {
      this.playButton.style.opacity = '0.5';
    });
  }

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play().catch(() => {});
      this.container.classList.add('playing');
    } else {
      this.audio.pause();
      this.container.classList.remove('playing');
    }
  }

  updateProgress() {
    if (!this.audio.duration) return;
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    this.progressBar.style.width = `${progress}%`;
    this.updateDuration();
  }

  updateDuration() {
    if (!this.durationElement || !this.audio.duration) return;
    const currentTime = this.formatTime(this.audio.currentTime);
    const duration = this.formatTime(this.audio.duration);
    this.durationElement.textContent = `${currentTime} / ${duration}`;
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  handleEnd() {
    this.container.classList.remove('playing');
    this.progressBar.style.width = '0%';
  }
}

class Slider {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.slides = this.container.querySelectorAll('.slider__slide');
    this.prevButton = this.container.querySelector('.slider__button--prev');
    this.nextButton = this.container.querySelector('.slider__button--next');
    this.dotsContainer = this.container.querySelector('.slider__dots');
    
    this.currentSlide = 0;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000;

    this.init();
  }

  init() {
    if (this.slides.length === 0) return;

    this.createDots();
    this.addEventListeners();
    this.startAutoPlay();

    this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.container.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  createDots() {
    if (!this.dotsContainer) return;

    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('slider__dot');
      dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
      if (index === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
    });

    this.dots = this.dotsContainer.querySelectorAll('.slider__dot');
  }

  addEventListeners() {
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }

    document.addEventListener('keydown', (e) => {
      if (!isInViewport(this.container)) return;
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    this.handleSwipe();
  }

  handleSwipe() {
    let touchStartX = 0;
    let touchEndX = 0;

    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipeGesture(touchStartX, touchEndX);
    }, { passive: true });
  }

  handleSwipeGesture(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  goToSlide(index) {
    this.slides[this.currentSlide].classList.remove('slider__slide--active');
    if (this.dots) {
      this.dots[this.currentSlide].classList.remove('active');
    }

    this.currentSlide = index;

    this.slides[this.currentSlide].classList.add('slider__slide--active');
    if (this.dots) {
      this.dots[this.currentSlide].classList.add('active');
    }
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

class Gallery {
  constructor(selector) {
    this.items = document.querySelectorAll(selector);
    if (this.items.length === 0) return;
    this.init();
  }

  init() {
    this.items.forEach(item => {
      item.addEventListener('click', (e) => this.handleClick(e, item));
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleClick(e, item);
        }
      });
    });
  }

  handleClick(e, item) {
    const imageUrl = item.dataset.image;
    if (!imageUrl) return;

    const img = item.querySelector('img');
    if (img) {
      const alt = img.getAttribute('alt');
      this.openLightbox(imageUrl, alt);
    }
  }

  openLightbox(imageUrl, alt) {
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
      animation: fadeIn 0.3s ease;
    `;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = alt || 'Увеличенное изображение';
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    `;

    lightbox.appendChild(img);
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', () => {
      lightbox.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => document.body.removeChild(lightbox), 300);
    });

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        lightbox.click();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
}

class Tabs {
  constructor(selector) {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.buttons = this.container.querySelectorAll('.tabs__button');
    this.panels = this.container.querySelectorAll('.tabs__panel');

    this.init();
  }

  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', () => this.switchTab(button));
    });
  }

  switchTab(clickedButton) {
    const targetTab = clickedButton.dataset.tab;

    this.buttons.forEach(button => {
      button.classList.remove('tabs__button--active');
      button.setAttribute('aria-selected', 'false');
    });

    this.panels.forEach(panel => {
      panel.classList.remove('tabs__panel--active');
    });

    clickedButton.classList.add('tabs__button--active');
    clickedButton.setAttribute('aria-selected', 'true');

    const targetPanel = document.getElementById(`${targetTab}-panel`);
    if (targetPanel) {
      targetPanel.classList.add('tabs__panel--active');
    }
  }
}

class FormValidator {
  constructor(selector) {
    this.form = document.querySelector(selector);
    if (!this.form) return;

    this.fields = {
      name: this.form.querySelector('#name'),
      email: this.form.querySelector('#email'),
      phone: this.form.querySelector('#phone'),
      subject: this.form.querySelector('#subject'),
      message: this.form.querySelector('#message'),
      privacy: this.form.querySelector('#privacy')
    };

    this.errors = {
      name: this.form.querySelector('#nameError'),
      email: this.form.querySelector('#emailError'),
      subject: this.form.querySelector('#subjectError'),
      message: this.form.querySelector('#messageError'),
      privacy: this.form.querySelector('#privacyError')
    };

    this.successMessage = this.form.querySelector('#formSuccess');

    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      if (!field) return;

      field.addEventListener('blur', () => this.validateField(fieldName));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          this.validateField(fieldName);
        }
      });
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.clearErrors();

    let isValid = true;
    Object.keys(this.fields).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });

    if (isValid) {
      this.submitForm();
    } else {
      const firstError = this.form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }
    }
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    const errorElement = this.errors[fieldName];
    
    if (!field) return true;

    let isValid = true;
    let errorMessage = '';

    if (fieldName === 'name') {
      if (!field.value.trim()) {
        isValid = false;
        errorMessage = 'Пожалуйста, введите ваше имя';
      } else if (field.value.trim().length < 2) {
        isValid = false;
        errorMessage = 'Имя должно содержать минимум 2 символа';
      }
    }

    if (fieldName === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!field.value.trim()) {
        isValid = false;
        errorMessage = 'Пожалуйста, введите email';
      } else if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Пожалуйста, введите корректный email';
      }
    }

    if (fieldName === 'subject') {
      if (!field.value) {
        isValid = false;
        errorMessage = 'Пожалуйста, выберите тему';
      }
    }

    if (fieldName === 'message') {
      if (!field.value.trim()) {
        isValid = false;
        errorMessage = 'Пожалуйста, введите сообщение';
      } else if (field.value.trim().length < 10) {
        isValid = false;
        errorMessage = 'Сообщение должно содержать минимум 10 символов';
      }
    }

    if (fieldName === 'privacy') {
      if (!field.checked) {
        isValid = false;
        errorMessage = 'Необходимо согласие на обработку данных';
      }
    }

    if (!isValid) {
      field.classList.add('error');
      if (errorElement) {
        errorElement.textContent = errorMessage;
      }
    } else {
      field.classList.remove('error');
      if (errorElement) {
        errorElement.textContent = '';
      }
    }

    return isValid;
  }

  clearErrors() {
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      const errorElement = this.errors[fieldName];
      
      if (field) field.classList.remove('error');
      if (errorElement) errorElement.textContent = '';
    });
  }

  submitForm() {
    if (this.successMessage) {
      this.successMessage.classList.add('show');
      this.form.reset();
      setTimeout(() => {
        this.successMessage.classList.remove('show');
      }, 5000);
    }

    this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

class BackToTop {
  constructor(selector) {
    this.button = document.querySelector(selector);
    if (!this.button) return;
    this.init();
  }

  init() {
    this.handleScroll();
    window.addEventListener('scroll', debounce(() => this.handleScroll(), 100));

    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  handleScroll() {
    if (window.scrollY > 500) {
      this.button.classList.add('show');
    } else {
      this.button.classList.remove('show');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  new ScrollAnimations();
  new AudioPlayer('.audio-player');
  new Slider('.slider');
  new Gallery('.gallery__item');
  new Tabs('.tabs');
  new FormValidator('#contactForm');
  new BackToTop('#backToTop');
});


