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