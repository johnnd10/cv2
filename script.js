document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document
    .querySelectorAll(".nav-menu a[href^='#'], .brand[href^='#'], .site-footer a[href^='#']")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const rawTarget = link.getAttribute("href");

        if (!rawTarget || rawTarget === "#") return;

        const target = document.querySelector(rawTarget);

        if (!target) return;

        event.preventDefault();

        navMenu?.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");

        const headerHeight = header?.offsetHeight || 0;
        const top =
          rawTarget === "#inicio"
            ? 0
            : target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top,
          behavior: "smooth",
        });

        history.replaceState(null, "", rawTarget);
      });
    });

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
  const heroStage = document.querySelector(".hero-stage");
  let activeHeroIndex = 0;
  let heroTimer = null;
  let heroStartX = 0;
  let heroDeltaX = 0;
  let heroWasDragging = false;

  const heroClasses = ["is-center", "is-left", "is-right", "is-far-left", "is-far-right"];

  const updateHeroCarousel = () => {
    if (!heroSlides.length) return;

    heroSlides.forEach((slide, index) => {
      slide.classList.remove(...heroClasses);

      const total = heroSlides.length;
      const diff = (index - activeHeroIndex + total) % total;

      if (diff === 0) {
        slide.classList.add("is-center");
      } else if (diff === 1) {
        slide.classList.add("is-right");
      } else if (diff === 2) {
        slide.classList.add("is-far-right");
      } else if (diff === total - 1) {
        slide.classList.add("is-left");
      } else if (diff === total - 2) {
        slide.classList.add("is-far-left");
      }
    });
  };

  const moveHero = (direction) => {
    if (!heroSlides.length) return;

    activeHeroIndex =
      (activeHeroIndex + direction + heroSlides.length) % heroSlides.length;

    updateHeroCarousel();
  };

  const startHeroAutoplay = () => {
    if (!heroSlides.length) return;

    stopHeroAutoplay();

    heroTimer = window.setInterval(() => {
      moveHero(1);
    }, 2800);
  };

  const stopHeroAutoplay = () => {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
  };

  if (heroSlides.length && heroStage) {
    updateHeroCarousel();
    startHeroAutoplay();

    heroStage.addEventListener("mouseenter", stopHeroAutoplay);
    heroStage.addEventListener("mouseleave", startHeroAutoplay);

    heroStage.addEventListener("focusin", stopHeroAutoplay);
    heroStage.addEventListener("focusout", startHeroAutoplay);

    heroStage.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveHero(-1);
        startHeroAutoplay();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveHero(1);
        startHeroAutoplay();
      }
    });

    heroStage.addEventListener("pointerdown", (event) => {
      heroStartX = event.clientX;
      heroDeltaX = 0;
      heroWasDragging = false;
      heroStage.classList.add("is-dragging");
      document.body.classList.add("no-select");
      stopHeroAutoplay();
    });

    window.addEventListener("pointermove", (event) => {
      if (!heroStage.classList.contains("is-dragging")) return;

      heroDeltaX = event.clientX - heroStartX;

      if (Math.abs(heroDeltaX) > 8) {
        heroWasDragging = true;
      }
    });

    window.addEventListener("pointerup", () => {
      if (!heroStage.classList.contains("is-dragging")) return;

      heroStage.classList.remove("is-dragging");
      document.body.classList.remove("no-select");

      if (Math.abs(heroDeltaX) > 44) {
        moveHero(heroDeltaX < 0 ? 1 : -1);
      }

      startHeroAutoplay();
    });

    heroStage.addEventListener("click", (event) => {
      if (heroWasDragging) return;

      const rect = heroStage.getBoundingClientRect();
      const clickX = event.clientX - rect.left;

      if (clickX < rect.width * 0.34) {
        moveHero(-1);
      }

      if (clickX > rect.width * 0.66) {
        moveHero(1);
      }

      startHeroAutoplay();
    });
  }

  const galleryGrid = document.getElementById("gallery-grid");
  const galleryTabs = Array.from(document.querySelectorAll(".gallery-tab"));
  const loadMoreButton = document.getElementById("gallery-load-more");
  const galleryImages = window.galleryImages || {};

  let activeGalleryCategory = "bodas";
  let visibleGalleryCount = 8;
  let activeGalleryItems = [];

  const galleryLabels = {
    bodas: "Bodas",
    "xv-anos": "XV años",
    "tres-anos": "3 años",
    bautizo: "Bautizo",
    newborn: "Newborn",
  };

  const renderGallery = () => {
    if (!galleryGrid) return;

    const images = galleryImages[activeGalleryCategory] || [];
    activeGalleryItems = images;

    galleryGrid.innerHTML = "";

    if (!images.length) {
      galleryGrid.innerHTML = `
        <p class="gallery-empty">Aún no hay fotografías disponibles en esta categoría.</p>
      `;

      if (loadMoreButton) {
        loadMoreButton.style.display = "none";
      }

      return;
    }

    images.slice(0, visibleGalleryCount).forEach((src, index) => {
      const button = document.createElement("button");
      button.className = "gallery-item";
      button.type = "button";
      button.dataset.index = String(index);
      button.setAttribute(
        "aria-label",
        `Abrir fotografía de ${galleryLabels[activeGalleryCategory] || "portafolio"}`
      );

      const image = document.createElement("img");
      image.src = src;
      image.alt = `Fotografía de ${galleryLabels[activeGalleryCategory] || "portafolio"}`;
      image.loading = "lazy";

      button.appendChild(image);
      galleryGrid.appendChild(button);
    });

    if (loadMoreButton) {
      loadMoreButton.style.display =
        visibleGalleryCount >= images.length ? "none" : "inline-flex";
    }
  };

  galleryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;

      if (!category) return;

      activeGalleryCategory = category;
      visibleGalleryCount = 8;

      galleryTabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      renderGallery();
    });
  });

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
      visibleGalleryCount += 8;
      renderGallery();
    });
  }

  renderGallery();

  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");

  let lightboxIndex = 0;

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage || !activeGalleryItems.length) return;

    lightboxIndex = index;
    lightboxImage.src = activeGalleryItems[lightboxIndex];
    lightboxImage.alt = `Fotografía de ${
      galleryLabels[activeGalleryCategory] || "portafolio"
    }`;
    lightboxCaption.textContent = galleryLabels[activeGalleryCategory] || "Portafolio";

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) return;

    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    document.body.classList.remove("lightbox-open");
  };

  const moveLightbox = (direction) => {
    if (!activeGalleryItems.length) return;

    lightboxIndex =
      (lightboxIndex + direction + activeGalleryItems.length) %
      activeGalleryItems.length;

    openLightbox(lightboxIndex);
  };

  if (galleryGrid) {
    galleryGrid.addEventListener("click", (event) => {
      const item = event.target.closest(".gallery-item");

      if (!item) return;

      openLightbox(Number(item.dataset.index || 0));
    });
  }

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", () => moveLightbox(-1));
  lightboxNext?.addEventListener("click", () => moveLightbox(1));

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  const previewVideos = Array.from(document.querySelectorAll(".video-preview"));
  const videoTriggers = Array.from(document.querySelectorAll(".video-trigger"));
  const videoModal = document.getElementById("video-modal");
  const videoModalPlayer = document.getElementById("video-modal-player");
  const videoModalClose = document.querySelector(".video-modal-close");

  const playPreviewIfVisible = (video) => {
    const rect = video.getBoundingClientRect();
    const visible = rect.top < window.innerHeight && rect.bottom > 0;

    if (visible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.35,
      }
    );

    previewVideos.forEach((video) => videoObserver.observe(video));
  } else {
    previewVideos.forEach((video) => video.play().catch(() => {}));
  }

  const openVideoModal = (src) => {
    if (!videoModal || !videoModalPlayer || !src) return;

    previewVideos.forEach((video) => video.pause());

    videoModalPlayer.src = src;
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

    previewVideos.forEach(playPreviewIfVisible);
  };

  videoTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openVideoModal(trigger.dataset.video);
    });
  });

  videoModalClose?.addEventListener("click", closeVideoModal);

  videoModal?.addEventListener("click", (event) => {
    if (event.target === videoModal) {
      closeVideoModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!videoModal?.classList.contains("open")) return;

    if (event.key === "Escape") {
      closeVideoModal();
    }
  });

  const whatsappForm = document.getElementById("whatsapp-form");

  if (whatsappForm) {
    whatsappForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(whatsappForm);

      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const eventType = String(formData.get("event") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const whatsappMessage = `Hola Claudia, me gustaría solicitar información para una sesión o cobertura.

Nombre: ${name}
Correo: ${email}
Tipo de evento: ${eventType}

Mensaje:
${message}`;

      const whatsappUrl = `https://wa.me/524775811873?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  }
});