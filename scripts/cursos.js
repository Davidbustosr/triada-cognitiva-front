/* ==========================================================================
   LISTADO DE CURSOS (cursos.html)
   - Carga cursos desde JSON
   - Renderiza cards profesionales
   - Animación reveal con IntersectionObserver
========================================================================== */

// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  // 1) Ajusta estas rutas si cambias tu estructura
  // Config: DATA_URL -> se usa en este archivo para dirigir rutas / llaves / URLs
  const DATA_URL = "cursos.json";
  // Config: IMAGE_BASE -> se usa en este archivo para dirigir rutas / llaves / URLs
  const IMAGE_BASE = "assets/cursos/"; // cambia a "assets/images/" si ahí guardas las imágenes

  // 2) Elementos del DOM
  const gridEl = document.getElementById("coursesGrid");
  const emptyEl = document.getElementById("coursesEmpty");
  const totalEl = document.getElementById("coursesTotal");
  const countEl = document.getElementById("coursesCount");

  if (!gridEl) return;

  // Helpers
  // Función: formatCLP()
  const formatCLP = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  });
};

  // Función: parseHours()
  const parseHours = (txt) => {
    // "30 horas" -> 30
    const m = String(txt || "").match(/(\d+)\s*hora/i);
    return m ? Number(m[1]) : null;
  };

  // Función: getDiscountPercent()
  const getDiscountPercent = (oldPrice, newPrice) => {
    const oldN = Number(oldPrice);
    const newN = Number(newPrice);
    if (!oldN || !newN || newN >= oldN) return null;
    return Math.round(((oldN - newN) / oldN) * 100);
  };

  const safeText = (s) => String(s ?? "").replace(/[<>]/g, "");

  // Función: buildImageUrl()
  const buildImageUrl = (imgName) => {
    if (!imgName) return "";
    // Si viene con http(s) o con /, lo respetamos
    if (/^https?:\/\//i.test(imgName) || imgName.startsWith("/")) return imgName;
    return IMAGE_BASE + imgName;
  };

  // Función: renderCards()
  const renderCards = (courses) => {
    gridEl.innerHTML = "";

    if (!Array.isArray(courses) || courses.length === 0) {
      emptyEl?.classList.remove("hidden");
      totalEl && (totalEl.textContent = "0");
      countEl && (countEl.textContent = "0");
      return;
    }

    emptyEl?.classList.add("hidden");
    totalEl && (totalEl.textContent = String(courses.length));
    countEl && (countEl.textContent = String(courses.length));

    const frag = document.createDocumentFragment();

    courses.forEach((c, idx) => {
      const id = safeText(c.id || `curso-${idx + 1}`);
      const titulo = safeText(c.titulo || "Curso");
      const subtitulo = safeText(c.subtitulo || "");
      const modalidad = safeText(c.modalidad || "Online");
      const duracion = safeText(c.duracion || "");
      const precio = Number(c.precio) || 0;
      const precioDesc = Number(c.precio_descuento) || 0;
      const rating = Number(c.rating) || null;

      const hasDiscount = precioDesc > 0 && precio > 0 && precioDesc < precio;
      const priceNow = hasDiscount ? precioDesc : precio;
      const discountPct = hasDiscount ? getDiscountPercent(precio, precioDesc) : null;

      const imgUrl = buildImageUrl(c.imagen);

      const card = document.createElement("article");
      card.className = "tc-course-card tc-reveal";
      card.style.transitionDelay = `${Math.min(idx, 10) * 30}ms`;

      card.innerHTML = `
        <div class="tc-course-media">
          <img
            src="${imgUrl}"
            alt="${titulo}"
            loading="lazy"
            onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, rgba(1,33,97,.92), rgba(5,174,238,.18))';"
          />

          <div class="tc-course-badges">
            <span class="tc-badge"><span class="dot" aria-hidden="true"></span>${modalidad}</span>
            ${duracion ? `<span class="tc-badge">${duracion}</span>` : ""}
          </div>

          ${rating ? `<div class="tc-course-rating">★ ${rating.toFixed(1)}</div>` : ""}
        </div>

        <div class="tc-course-body">
          <h3 class="tc-course-title">${titulo}</h3>
          <p class="tc-course-sub">${subtitulo}</p>

          <div class="tc-course-meta-row">
            <div class="tc-course-price">
              <span class="tc-price-now">${formatCLP(priceNow)}</span>
              ${hasDiscount ? `<span class="tc-price-old">${formatCLP(precio)}</span>` : ""}
            </div>

            ${discountPct ? `<span class="tc-discount">-${discountPct}%</span>` : ""}
          </div>
        </div>

        <div class="tc-course-actions">
          <a class="tc-btn-go" href="curso.html?id=${encodeURIComponent(id)}">Ver curso →</a>
          <a class="tc-btn-detail" href="curso.html?id=${encodeURIComponent(id)}">Detalle</a>
        </div>
      `;

      frag.appendChild(card);
    });

    gridEl.appendChild(frag);

    // Reveal
    setupReveal();
  };

  // Función: setupReveal()
  const setupReveal = () => {
    const els = document.querySelectorAll(".tc-reveal");

    // Si ya existe la clase de tu main.js, no estorba: solo agrega is-visible.
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12 });

    els.forEach((el) => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    });
  };

  const init = async () => {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`No se pudo cargar JSON (${res.status})`);
      const courses = await res.json();
      renderCards(courses);
    } catch (err) {
      console.error(err);
      emptyEl?.classList.remove("hidden");
      totalEl && (totalEl.textContent = "0");
      countEl && (countEl.textContent = "0");
    }
  };

  init();
})();

