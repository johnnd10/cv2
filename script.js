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
        targetId = "video";
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

  const heroCoverflow = document.querySelector(".hero-coverflow");
  const heroStage = document.querySelector(".hero-stage");
  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));

  if (heroCoverflow && heroStage && heroSlides.length) {
    let activeHeroIndex = 0;
    let heroAutoplay;
    let pointerStartX = 0;
    let pointerCurrentX = 0;
    let isDragging = false;
    let didDrag = false;

    const updateHeroCoverflow = () => {
      const total = heroSlides.length;

      heroSlides.forEach((slide, index) => {
        slide.classList.remove(
          "is-center",
          "is-left",
          "is-right",
          "is-far-left",
          "is-far-right"
        );

        const position = (index - activeHeroIndex + total) % total;

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

    const goToHeroSlide = (index) => {
      const total = heroSlides.length;
      activeHeroIndex = (index + total) % total;
      updateHeroCoverflow();
    };

    const nextHeroSlide = () => {
      goToHeroSlide(activeHeroIndex + 1);
    };

    const previousHeroSlide = () => {
      goToHeroSlide(activeHeroIndex - 1);
    };

    const startHeroAutoplay = () => {
      stopHeroAutoplay();
      heroAutoplay = window.setInterval(nextHeroSlide, 5200);
    };

    const stopHeroAutoplay = () => {
      if (heroAutoplay) {
        window.clearInterval(heroAutoplay);
      }
    };

    heroStage.addEventListener("pointerdown", (event) => {
      isDragging = true;
      didDrag = false;
      pointerStartX = event.clientX;
      pointerCurrentX = event.clientX;
      heroStage.classList.add("is-dragging");
      document.body.classList.add("no-select");
      stopHeroAutoplay();
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
      heroStage.classList.remove("is-dragging");
      document.body.classList.remove("no-select");

      if (Math.abs(distance) > 42) {
        if (distance < 0) {
          nextHeroSlide();
        } else {
          previousHeroSlide();
        }
      }

      startHeroAutoplay();
    });

    heroStage.addEventListener("click", (event) => {
      if (didDrag) return;

      const rect = heroStage.getBoundingClientRect();
      const x = event.clientX - rect.left;

      if (x < rect.width * 0.34) {
        previousHeroSlide();
        startHeroAutoplay();
      } else if (x > rect.width * 0.66) {
        nextHeroSlide();
        startHeroAutoplay();
      }
    });

    heroStage.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        nextHeroSlide();
        startHeroAutoplay();
      }

      if (event.key === "ArrowLeft") {
        previousHeroSlide();
        startHeroAutoplay();
      }
    });

    heroCoverflow.addEventListener("mouseenter", stopHeroAutoplay);
    heroCoverflow.addEventListener("mouseleave", startHeroAutoplay);

    updateHeroCoverflow();
    startHeroAutoplay();
  }

  const previewVideos = Array.from(document.querySelectorAll(".video-preview"));
  const videoTriggers = Array.from(document.querySelectorAll(".video-trigger"));
  const videoModal = document.getElementById("video-modal");
  const videoModalPlayer = document.getElementById("video-modal-player");
  const videoModalClose = document.querySelector(".video-modal-close");

  const playPreviewIfVisible = (video) => {
    const rect = video.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible) {
      video.muted = true;
      video.play().catch(() => {});
    }
  };

  if ("IntersectionObserver" in window && previewVideos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          video.muted = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.35
    });

    previewVideos.forEach((video) => {
      video.muted = true;
      videoObserver.observe(video);
    });
  }

  const openVideoModal = (videoPath) => {
    if (!videoModal || !videoModalPlayer) return;

    previewVideos.forEach((video) => video.pause());

    videoModalPlayer.src = videoPath;
    videoModalPlayer.muted = false;
    videoModalPlayer.controls = true;

    videoModal.classList.add("open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    videoModalPlayer.play().catch(() => {});
  };

  const closeVideoModal = () => {
    if (!videoModal || !videoModalPlayer) return;

    videoModalPlayer.pause();
    videoModalPlayer.removeAttribute("src");
    videoModalPlayer.load();

    videoModal.classList.remove("open");
    videoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    previewVideos.forEach((video) => {
      playPreviewIfVisible(video);
    });
  };

  videoTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const videoPath = trigger.dataset.video;
      openVideoModal(videoPath);
    });
  });

  videoModalClose?.addEventListener("click", closeVideoModal);

  videoModal?.addEventListener("click", (event) => {
    if (event.target === videoModal) {
      closeVideoModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && videoModal?.classList.contains("open")) {
      closeVideoModal();
    }
  });

  const galleryImages = window.galleryImages || {};
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryTabs = Array.from(document.querySelectorAll(".gallery-tab"));
  const galleryMoreButton = document.getElementById("gallery-more-button");
  const galleryActions = document.getElementById("gallery-actions");
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
  let visibleGalleryCount = 8;

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

      if (galleryActions) {
        galleryActions.style.display = "none";
      }

      return;
    }

    const visibleImages = activeGalleryImages.slice(0, visibleGalleryCount);

    visibleImages.forEach((imagePath, index) => {
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

    if (galleryActions && galleryMoreButton) {
      if (visibleGalleryCount >= activeGalleryImages.length) {
        galleryActions.style.display = "none";
      } else {
        galleryActions.style.display = "flex";
        galleryMoreButton.textContent = `Ver más fotografías`;
      }
    }
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
      visibleGalleryCount = 8;
      renderGallery(tab.dataset.category);
    });
  });

  galleryMoreButton?.addEventListener("click", () => {
    visibleGalleryCount += 8;
    renderGallery(activeGalleryCategory);
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