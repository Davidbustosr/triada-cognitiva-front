/***************************************************************************************************
 * scripts/curso.js
 * - Archivo de lógica de interfaz (front-end)
 * - Comentarios pensados para que el backend (Manuel) entienda qué espera el front y qué datos usa.
 * - Importante: NO cambia el comportamiento; solo agrega explicación.
 ***************************************************************************************************/

// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  // ✅ AJUSTA ESTO A TU ESTRUCTURA REAL:
  // Si tu JSON está en "cursos/data/cursos.json" cambia DATA_URL a eso.
  // Config: DATA_URL -> se usa en este archivo para dirigir rutas / llaves / URLs
  const DATA_URL = "cursos.json";

  // ✅ Carpeta de imágenes de cursos (según tu estructura)
  // Ej: assets/images/funciones.jpg
  // Config: IMAGE_BASE -> se usa en este archivo para dirigir rutas / llaves / URLs
  const IMAGE_BASE = "assets/images/";

  // fallback (si falta imagen o hay error)
  // Config: FALLBACK_IMG -> se usa en este archivo para dirigir rutas / llaves / URLs
  const FALLBACK_IMG = "assets/images/hero-banner.jpg";

  // ✅ WhatsApp real
  // Config: WA_NUMBER -> se usa en este archivo para dirigir rutas / llaves / URLs
  const WA_NUMBER = "56900000000";

// Helpers DOM: $() busca un elemento (querySelector) para escribir menos código.
  const $ = (id) => document.getElementById(id);

  // Función: getIdFromUrl()
  const getIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  };

  // Función: formatCLP()
  const formatCLP = (value) => {
    const n = Number(value) || 0;
    return n.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  };

  const safeText = (s) => String(s ?? "").replace(/[<>]/g, "");

  const setText = (el, text) => { if (el) el.textContent = text; };
  const setHTML = (el, html) => { if (el) el.innerHTML = html; };

  const show = (el) => el && el.classList.remove("hidden");
  const hide = (el) => el && el.classList.add("hidden");

  // Función: revealOnScroll()
  const revealOnScroll = () => {
    const els = document.querySelectorAll(".tc-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  };

  // Función: setupFaq()
  const setupFaq = () => {
    const qs = document.querySelectorAll(".tc-faq__q");
    qs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        const answer = btn.nextElementSibling;

        btn.setAttribute("aria-expanded", String(!expanded));
        if (answer) {
          answer.hidden = expanded;
          const icon = btn.querySelector("i");
          if (icon) icon.textContent = expanded ? "+" : "–";
        }
      });
    });
  };

  const whatsappSVG = () => `
    <svg class="tc-wa-ico" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="#25D366" d="M16 3C9.383 3 4 8.383 4 15c0 2.322.63 4.597 1.826 6.586L4 29l7.6-1.786A11.93 11.93 0 0 0 16 27c6.617 0 12-5.383 12-12S22.617 3 16 3z"/>
      <path fill="#fff" d="M22.7 19.4c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1c-.3-.2-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5H12c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.8-.7 2.1-1.4.3-.7.3-1.2.2-1.4-.1-.2-.3-.3-.6-.4z"/>
    </svg>
  `;

  // Función: renderCourse()
  const renderCourse = (course) => {
    // Title / subtitle
    const title = safeText(course.titulo);
    setText($("courseTitle"), title);
    setText($("courseSubtitle"), safeText(course.subtitulo || ""));

    // ✅ Image
    const img = $("courseImage");
    if (img) {
      const imgName = (course.imagen || "").trim();
      const src = imgName ? (IMAGE_BASE + imgName) : FALLBACK_IMG;
      img.src = src;
      img.alt = title;
      img.onerror = () => { img.src = FALLBACK_IMG; };
    }

    // Badges / meta
    const modality = safeText(course.modalidad || "Online");
    const duration = safeText(course.duracion || "—");

    setText($("courseModality"), modality);
    setText($("courseDuration"), duration);
    setText($("courseModality2"), modality);
    setText($("courseDuration2"), duration);

    // Prices
    const priceNow = Number(course.precio_descuento ?? course.precio ?? 0);
    const priceOld = Number(course.precio ?? 0);

    setText($("coursePriceNow"), formatCLP(priceNow));

    const oldEl = $("coursePriceOld");
    if (oldEl) {
      if (priceOld && priceOld > priceNow) {
        oldEl.textContent = formatCLP(priceOld);
        oldEl.style.display = "block";
      } else {
        oldEl.style.display = "none";
      }
    }

    // Description
    setText($("courseDescription"), safeText(course.descripcion || "Sin descripción disponible."));

    // Topics
    const topicsEl = $("courseTopics");
    if (topicsEl) {
      const topics = Array.isArray(course.temas) ? course.temas : [];
      setHTML(
        topicsEl,
        topics.length
          ? topics.map(t => `<li>${safeText(t)}</li>`).join("")
          : `<li>Temario por confirmar.</li>`
      );
    }

    // ✅ CTA WhatsApp (con SVG + estilo “pro”)
    const cta = $("courseCtaPrimary");
    if (cta) {
      const msg = encodeURIComponent(`Hola! Me interesa el curso: ${course.titulo}`);
      cta.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
      cta.target = "_blank";
      cta.rel = "noopener";

      // si tu HTML ya lo pone como botón, solo le damos icono + texto y clase
      cta.classList.add("tc-action", "tc-action--wa");
      cta.innerHTML = `${whatsappSVG()}<span>Hablar por WhatsApp</span>`;
    }

    document.title = `${title} | Triada Cognitiva`;
  };

  const init = async () => {
    revealOnScroll();
    setupFaq();

    const courseId = getIdFromUrl();
    const err = $("courseError");

    if (!courseId) {
      show(err);
      return;
    }

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const list = Array.isArray(data) ? data : [];
      const course = list.find(c => String(c.id) === String(courseId));

      if (!course) {
        show(err);
        return;
      }

      hide(err);
      renderCourse(course);
    } catch (e) {
      show(err);
    }
  };

// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
  document.addEventListener("DOMContentLoaded", init);
})();