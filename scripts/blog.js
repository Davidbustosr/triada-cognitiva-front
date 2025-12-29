/***************************************************************************************************
 * scripts/blog.js
 * - Archivo de lógica de interfaz (front-end)
 * - Comentarios pensados para que el backend (Manuel) entienda qué espera el front y qué datos usa.
 * - Importante: NO cambia el comportamiento; solo agrega explicación.
 ***************************************************************************************************/

// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
// Helpers DOM: $() busca un elemento (querySelector) para escribir menos código.
  const $ = (sel, root = document) => root.querySelector(sel);
// Helpers DOM: $$() devuelve una lista (Array) de elementos (querySelectorAll).
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ✅ Manuel: cambia esto por tu endpoint real
  // Ejemplos: "/api/blog", "https://tu-dominio.cl/api/blog"
  // Config: BLOG_API_URL -> se usa en este archivo para dirigir rutas / llaves / URLs
  const BLOG_API_URL = "blog.json"; // fallback local

  // Navbar offset (para anclas y padding superior)
  // Función: navbarOffsetFix()
  const navbarOffsetFix = () => {
    const nav = $("#siteNavbar") || $(".navbar");
    if (!nav) return;

    // Función: set()
    const set = () => {
      const h = nav.offsetHeight || 150;
      document.documentElement.style.setProperty("--nav-offset", `${h}px`);
    };

    set();
    window.addEventListener("resize", set, { passive: true });
  };

  // Función: navbarShadowOnScroll()
  const navbarShadowOnScroll = () => {
    const nav = $("#siteNavbar") || $(".navbar");
    if (!nav) return;

    // Función: onScroll()
    const onScroll = () => {
      if (window.scrollY > 10) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  };

  // Función: revealOnScroll()
  const revealOnScroll = () => {
    const els = $$(".tc-reveal");
    if (!els.length) return;

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

  // ----------------------
  // Helpers
  // ----------------------
  // Función: escapeHTML()
  const escapeHTML = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  // Función: toDate()
  const toDate = (v) => {
    const d = new Date(v || "");
    return isNaN(d.getTime()) ? null : d;
  };

  // Función: formatDateCL()
  const formatDateCL = (v) => {
    const d = toDate(v);
    if (!d) return "Fecha por confirmar";
    return d.toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "2-digit" });
  };

  // Función: excerpt()
  const excerpt = (text, n = 160) => {
    const t = String(text ?? "").trim().replace(/\s+/g, " ");
    if (!t) return "";
    return t.length > n ? t.slice(0, n - 1) + "…" : t;
  };

  // Función: paragraphsHTML()
  const paragraphsHTML = (text) => {
    const raw = String(text ?? "").trim();
    if (!raw) return "<p>—</p>";
    const parts = raw.split(/\n{2,}/g).map(p => p.trim()).filter(Boolean);
    return parts.map(p => `<p>${escapeHTML(p).replace(/\n/g, "<br>")}</p>`).join("");
  };

  // Función: getIdFromUrl()
  const getIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  };

  // Función: setFeatured()
  const setFeatured = (post) => {
    const titleEl = $("#featuredTitle");
    const exEl = $("#featuredExcerpt");
    const aEl = $("#featuredAuthor");
    const dEl = $("#featuredDate");
    const linkEl = $("#featuredLink");

    if (!post) {
      if (titleEl) titleEl.textContent = "Aún no hay publicaciones";
      if (exEl) exEl.textContent = "Cuando el administrador publique, aparecerá aquí.";
      if (aEl) aEl.textContent = "—";
      if (dEl) dEl.textContent = "—";
      if (linkEl) linkEl.href = "blog.html";
      return;
    }

    if (titleEl) titleEl.textContent = post.title || "Reflexión";
    if (exEl) exEl.textContent = excerpt(post.content, 180);
    if (aEl) aEl.textContent = post.author || "Equipo Triada Cognitiva";
    if (dEl) dEl.textContent = formatDateCL(post.createdAt);
    if (linkEl) linkEl.href = `blog.html?id=${encodeURIComponent(post.id)}`;
  };

  // ----------------------
  // Render
  // ----------------------
  // Función: renderGrid()
  const renderGrid = (posts) => {
    const grid = $("#blogGrid");
    if (!grid) return;

    grid.innerHTML = posts.map((p, idx) => {
      const title = escapeHTML(p.title || "Reflexión");
      const ex = escapeHTML(excerpt(p.content, 155));
      const author = escapeHTML(p.author || "Equipo Triada Cognitiva");
      const date = escapeHTML(formatDateCL(p.createdAt));
      const href = `blog.html?id=${encodeURIComponent(p.id)}`;

      return `
        <article class="tc-post tc-reveal" style="--d:${idx * 60}ms">
          <div class="tc-post__inner">
            <p class="tc-post__kicker">REFLEXIÓN</p>
            <h3 class="tc-post__title">${title}</h3>
            <p class="tc-post__excerpt">${ex}</p>

            <div class="tc-post__meta">
              <div class="tc-post__by">
                <strong>${author}</strong>
                <span>${date}</span>
              </div>
              <a class="tc-post__cta" href="${href}" aria-label="Leer: ${title}">Leer →</a>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // dispara reveal en elementos nuevos
    setTimeout(() => {
      revealOnScroll();
    }, 0);
  };

  // Función: renderDetail()
  const renderDetail = (post) => {
    const detail = $("#blogDetail");
    if (!detail) return;

    const titleEl = $("#postTitle");
    const bodyEl = $("#postBody");
    const authorEl = $("#postAuthor");
    const cityEl = $("#postCity");
    const dateEl = $("#postDate");
    const tagsEl = $("#postTags");

    if (titleEl) titleEl.textContent = post.title || "Reflexión";
    if (bodyEl) bodyEl.innerHTML = paragraphsHTML(post.content);

    const author = post.author || "Equipo Triada Cognitiva";
    const city = [post.city, post.country].filter(Boolean).join(", ") || "—";

    if (authorEl) authorEl.textContent = author;
    if (cityEl) cityEl.textContent = city;
    if (dateEl) dateEl.textContent = formatDateCL(post.createdAt);

    if (tagsEl) {
      const tags = Array.isArray(post.tags) ? post.tags : [];
      tagsEl.innerHTML = tags.slice(0, 12).map(t => `<span class="tc-tag">${escapeHTML(t)}</span>`).join("");
    }

    detail.classList.remove("hidden");

    // Copiar link
    $("#copyLinkBtn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        $("#copyLinkBtn").textContent = "Copiado ✅";
        setTimeout(() => { $("#copyLinkBtn").textContent = "Copiar link"; }, 1100);
      } catch {
        alert("No se pudo copiar. Copia el link manualmente desde la barra del navegador.");
      }
    });

    // Scroll al detalle
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ----------------------
  // Data loading
  // ----------------------
  // Función: normalize()
  const normalize = (raw) => {
    const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.posts) ? raw.posts : []);
    return arr
      .map((p) => ({
        id: String(p.id ?? p._id ?? "").trim(),
        title: String(p.title ?? p.titulo ?? "").trim(),
        content: String(p.content ?? p.contenido ?? p.text ?? "").trim(),
        author: String(p.author ?? p.autor ?? "Equipo Triada Cognitiva").trim(),
        city: String(p.city ?? p.ciudad ?? "").trim(),
        country: String(p.country ?? p.pais ?? "").trim(),
        createdAt: p.createdAt ?? p.fecha ?? p.created_at ?? null,
        tags: Array.isArray(p.tags) ? p.tags : []
      }))
      .filter(p => p.id && p.title && p.content);
  };

  const loadPosts = async () => {
    const state = $("#blogState");
    const empty = $("#blogEmpty");
    const error = $("#blogError");
    const countEl = $("#blogCount");

    const show = (el) => el && el.classList.remove("hidden");
    const hide = (el) => el && el.classList.add("hidden");

    show(state);
    hide(empty);
    hide(error);

    try {
      const res = await fetch(BLOG_API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const posts = normalize(raw);

      if (countEl) countEl.textContent = String(posts.length);

      if (!posts.length) {
        hide(state);
        show(empty);
        setFeatured(null);
        renderGrid([]);
        return { posts: [], filtered: [] };
      }

      // default: recientes primero
      posts.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

      hide(state);
      setFeatured(posts[0]);
      renderGrid(posts);

      return { posts, filtered: posts.slice() };
    } catch (e) {
      hide(state);
      show(error);
      setFeatured(null);
      return { posts: [], filtered: [] };
    }
  };

  // Función: applyFilters()
  const applyFilters = (allPosts) => {
    const q = ($("#blogSearch")?.value || "").trim().toLowerCase();
    const sort = ($("#blogSort")?.value || "new").toLowerCase();

    let list = allPosts.slice();

    if (q) {
      list = list.filter(p =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.content || "").toLowerCase().includes(q) ||
        (p.author || "").toLowerCase().includes(q)
      );
    }

    if (sort === "old") {
      list.sort((a, b) => (toDate(a.createdAt)?.getTime() || 0) - (toDate(b.createdAt)?.getTime() || 0));
    } else if (sort === "az") {
      list.sort((a, b) => (a.title || "").localeCompare((b.title || ""), "es", { sensitivity: "base" }));
    } else {
      list.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
    }

    renderGrid(list);
    return list;
  };

  // ----------------------
  // Init
  // ----------------------
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
  document.addEventListener("DOMContentLoaded", async () => {
    navbarOffsetFix();
    navbarShadowOnScroll();
    revealOnScroll();

    const retryBtn = $("#retryBtn");
    const search = $("#blogSearch");
    const sort = $("#blogSort");

    let all = [];
    const loaded = await loadPosts();
    all = loaded.posts;

    // Detalle si viene con ?id=
    const id = getIdFromUrl();
    if (id && all.length) {
      const post = all.find(p => String(p.id) === String(id));
      if (post) renderDetail(post);
    }

    // UI
    search?.addEventListener("input", () => applyFilters(all));
    sort?.addEventListener("change", () => applyFilters(all));

    retryBtn?.addEventListener("click", async () => {
      const loaded2 = await loadPosts();
      all = loaded2.posts;

      const id2 = getIdFromUrl();
      if (id2 && all.length) {
        const post = all.find(p => String(p.id) === String(id2));
        if (post) renderDetail(post);
      }
    });

    // Link “Ver listado”
    $("#goList")?.addEventListener("click", (e) => {
      const target = $("#listado");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();