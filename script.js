document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-menu a[href^='#'], .brand[href^='#'], .site-footer a[href^='#']"));

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const updateHeader = () => {
    if (!header) return;

    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const getScrollOffset = () => {
    if (!header) return 0;
    return header.offsetHeight - 2;
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const rawTarget = link.getAttribute("href");
      if (!rawTarget || !rawTarget.startsWith("#")) return;

      event.preventDefault();

      let targetId = rawTarget.slice(1);

      if (targetId === "drone-video") {
        targetId = "inicio";
      }

      const target = document.getElementById(targetId);
      if (!target) return;

      const offset = getScrollOffset();
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: "smooth"
      });

      history.pushState(null, "", rawTarget);

      if (navMenu && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.14
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  const sectionLinks = Array.from(document.querySelectorAll(".nav-menu a[href^='#']"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) return;

      const currentId = visibleEntries[0].target.id;

      sectionLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isDirectMatch = href === `#${currentId}`;
        const isContactMatch = href === "#contacto" && currentId === "reservar";

        link.classList.toggle("active", isDirectMatch || isContactMatch);
      });
    }, {
      rootMargin: "-45% 0px -45% 0px",
      threshold: [0.12, 0.3, 0.55]
    });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const coverflow = document.querySelector(".portfolio-coverflow");
  const coverflowStage = document.querySelector(".coverflow-stage");
  const coverflowSlides = Array.from(document.querySelectorAll(".coverflow-slide"));

  if (coverflow && coverflowStage && coverflowSlides.length) {
    let activeIndex = 0;
    let autoplay;
    let pointerStartX = 0;
    let pointerCurrentX = 0;
    let isDragging = false;
    let didDrag = false;

    const updateCoverflow = () => {
      const total = coverflowSlides.length;

      coverflowSlides.forEach((slide, index) => {
        slide.classList.remove(
          "is-center",
          "is-left",
          "is-right",
          "is-far-left",
          "is-far-right"
        );

        const position = (index - activeIndex + total) % total;

        if (position === 0) {
          slide.classList.add("is-center");
        } else if (position === 1) {
          slide.classList.add("is-right");
        } else if (position === 2) {
          slide.classList.add("is-far-right");
        } else if (position === total - 1) {
          slide.classList.add("is-left");
        } else if (position === total - 2) {
          slide.classList.add("is-far-left");
        }
      });
    };

    const goToSlide = (index) => {
      const total = coverflowSlides.length;
      activeIndex = (index + total) % total;
      updateCoverflow();
    };

    const nextSlide = () => {
      goToSlide(activeIndex + 1);
    };

    const previousSlide = () => {
      goToSlide(activeIndex - 1);
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplay = window.setInterval(nextSlide, 5200);
    };

    const stopAutoplay = () => {
      if (autoplay) {
        window.clearInterval(autoplay);
      }
    };

    coverflowStage.addEventListener("pointerdown", (event) => {
      isDragging = true;
      didDrag = false;
      pointerStartX = event.clientX;
      pointerCurrentX = event.clientX;
      coverflowStage.classList.add("is-dragging");
      document.body.classList.add("no-select");
      stopAutoplay();
    });

    window.addEventListener("pointermove", (event) => {
      if (!isDragging) return;

      pointerCurrentX = event.clientX;

      if (Math.abs(pointerCurrentX - pointerStartX) > 8) {
        didDrag = true;
      }
    });

    window.addEventListener("pointerup", () => {
      if (!isDragging) return;

      const distance = pointerCurrentX - pointerStartX;

      isDragging = false;
      coverflowStage.classList.remove("is-dragging");
      document.body.classList.remove("no-select");

      if (Math.abs(distance) > 42) {
        if (distance < 0) {
          nextSlide();
        } else {
          previousSlide();
        }
      }

      startAutoplay();
    });

    coverflowStage.addEventListener("click", (event) => {
      if (didDrag) return;

      const rect = coverflowStage.getBoundingClientRect();
      const x = event.clientX - rect.left;

      if (x < rect.width * 0.34) {
        previousSlide();
        startAutoplay();
      } else if (x > rect.width * 0.66) {
        nextSlide();
        startAutoplay();
      }
    });

    coverflowStage.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        nextSlide();
        startAutoplay();
      }

      if (event.key === "ArrowLeft") {
        previousSlide();
        startAutoplay();
      }
    });

    coverflow.addEventListener("mouseenter", stopAutoplay);
    coverflow.addEventListener("mouseleave", startAutoplay);

    updateCoverflow();
    startAutoplay();
  }

  const galleryImages = window.galleryImages || {};
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryTabs = Array.from(document.querySelectorAll(".gallery-tab"));
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");

  const galleryLabels = {
    "bodas": "Bodas",
    "xv-anos": "XV años",
    "tres-anos": "3 años",
    "bautizo": "Bautizo",
    "newborn": "Newborn"
  };

  let activeGalleryCategory = "bodas";
  let activeGalleryImages = [];
  let activeGalleryIndex = 0;

  const renderGallery = (category) => {
    if (!galleryGrid) return;

    activeGalleryCategory = category;
    activeGalleryImages = galleryImages[category] || [];

    galleryTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.category === category);
    });

    galleryGrid.innerHTML = "";

    if (!activeGalleryImages.length) {
      galleryGrid.innerHTML = `<p class="gallery-empty">No hay fotografías disponibles en esta categoría todavía.</p>`;
      return;
    }

    activeGalleryImages.forEach((imagePath, index) => {
      const button = document.createElement("button");
      button.className = "gallery-item";
      button.type = "button";
      button.setAttribute("aria-label", `Abrir fotografía de ${galleryLabels[category]}`);

      const image = document.createElement("img");
      image.src = imagePath;
      image.alt = `${galleryLabels[category]} - Fotografía ${index + 1}`;
      image.loading = "lazy";

      button.appendChild(image);

      button.addEventListener("click", () => {
        openLightbox(index);
      });

      galleryGrid.appendChild(button);
    });
  };

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage || !activeGalleryImages.length) return;

    activeGalleryIndex = index;
    const imagePath = activeGalleryImages[activeGalleryIndex];

    lightboxImage.src = imagePath;
    lightboxImage.alt = `${galleryLabels[activeGalleryCategory]} - Fotografía ${activeGalleryIndex + 1}`;

    if (lightboxCaption) {
      lightboxCaption.textContent = `${galleryLabels[activeGalleryCategory]} · ${activeGalleryIndex + 1} / ${activeGalleryImages.length}`;
    }

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) return;

    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    lightboxImage.src = "";
  };

  const showNextLightboxImage = () => {
    if (!activeGalleryImages.length) return;

    activeGalleryIndex = (activeGalleryIndex + 1) % activeGalleryImages.length;
    openLightbox(activeGalleryIndex);
  };

  const showPreviousLightboxImage = () => {
    if (!activeGalleryImages.length) return;

    activeGalleryIndex = (activeGalleryIndex - 1 + activeGalleryImages.length) % activeGalleryImages.length;
    openLightbox(activeGalleryIndex);
  };

  galleryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      renderGallery(tab.dataset.category);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxNext?.addEventListener("click", showNextLightboxImage);
  lightboxPrev?.addEventListener("click", showPreviousLightboxImage);

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("open")) return;

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowRight") {
      showNextLightboxImage();
    }

    if (event.key === "ArrowLeft") {
      showPreviousLightboxImage();
    }
  });

  if (galleryGrid) {
    renderGallery(activeGalleryCategory);
  }

  const whatsappForm = document.getElementById("whatsapp-form");

  if (whatsappForm) {
    whatsappForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(whatsappForm);

      const nombre = formData.get("nombre")?.trim();
      const correo = formData.get("correo")?.trim();
      const servicio = formData.get("servicio")?.trim();
      const mensaje = formData.get("mensaje")?.trim();

      const whatsappMessage = `Hola Claudia, me gustaría solicitar información para una sesión/cobertura.

Nombre: ${nombre}
Correo: ${correo}
Tipo de evento: ${servicio}
Mensaje: ${mensaje}`;

      const phoneNumber = "524775811873";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      window.open(whatsappUrl, "_blank");
    });
  }
});