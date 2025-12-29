/* ================================================================================================
  cuenta.js — MI CUENTA (Triada Cognitiva)
  - Guardia simple de sesión (mock): si no hay sesión => login.html
  - Render de compras (mock) + estados (loading/empty/error)
  - Tabs + animación reveal (IntersectionObserver)
================================================================================================ */

// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  // -----------------------------
  // CONFIG (mock)
  // -----------------------------
  // Config: AUTH_KEY -> se usa en este archivo para dirigir rutas / llaves / URLs
  const AUTH_KEY = "tc_session"; // donde guardamos “sesión” (mock)
  // Config: MOCK_DELAY_MS -> se usa en este archivo para dirigir rutas / llaves / URLs
  const MOCK_DELAY_MS = 650;     // simula espera de backend

  // Si luego Manuel conecta backend, esto se reemplaza por fetch() real
  // Config: MOCK_PURCHASES -> se usa en este archivo para dirigir rutas / llaves / URLs
  const MOCK_PURCHASES = [
    {
      id: "ord_1001",
      courseId: "funciones-ejecutivas",
      title: "Curso de Funciones Ejecutivas",
      date: "2025-12-20",
      status: "paid", // paid | pending | cancel
      price: 25000,
      priceDiscount: 20000
    },
    {
      id: "ord_1002",
      courseId: "tdah-aula",
      title: "TDAH en el Aula",
      date: "2025-12-12",
      status: "pending",
      price: 20000,
      priceDiscount: 16990
    }
  ];

  // -----------------------------
  // Helpers
  // -----------------------------
// Helpers DOM: $() busca un elemento (querySelector) para escribir menos código.
  const $ = (id) => document.getElementById(id);

  const show = (el) => el && el.classList.remove("hidden");
  const hide = (el) => el && el.classList.add("hidden");

  const safeText = (s) => String(s ?? "").replace(/[<>]/g, "");

  // Función: formatCLP()
  const formatCLP = (value) => {
    const n = Number(value) || 0;
    return n.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    });
  };

  // Función: formatDate()
  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "2-digit" });
  };

  // Función: statusLabel()
  const statusLabel = (s) => {
    if (s === "paid") return "Pagado";
    if (s === "pending") return "Pendiente";
    if (s === "cancel") return "Cancelado";
    return "—";
  };

  // Función: statusClass()
  const statusClass = (s) => {
    if (s === "paid") return "is-paid";
    if (s === "pending") return "is-pending";
    if (s === "cancel") return "is-cancel";
    return "";
  };

  // Función: initialsFromName()
  const initialsFromName = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    const a = (parts[0]?.[0] || "T").toUpperCase();
    const b = (parts[1]?.[0] || "C").toUpperCase();
    return a + b;
  };

  // -----------------------------
  // Reveal animation
  // -----------------------------
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

  // -----------------------------
  // Session guard (mock)
  // -----------------------------
  // Función: getSession()
  const getSession = () => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Función: requireSession()
  const requireSession = () => {
    const session = getSession();
    if (!session) {
      // Si no hay sesión, manda a login
      window.location.href = "login.html";
      return null;
    }
    return session;
  };

  // Función: logout()
  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "login.html";
  };

  // -----------------------------
  // Tabs
  // -----------------------------
  // Función: initTabs()
  const initTabs = () => {
    const tabs = Array.from(document.querySelectorAll(".tc-tab"));
    const panels = {
      purchases: $("panel-purchases"),
      courses: $("panel-courses"),
      settings: $("panel-settings")
    };

    // Función: setActive()
    const setActive = (name) => {
      tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === name));
      Object.entries(panels).forEach(([k, el]) => {
        if (!el) return;
        el.classList.toggle("is-active", k === name);
      });
    };

    tabs.forEach(t => {
      t.addEventListener("click", () => setActive(t.dataset.tab));
    });
  };

  // -----------------------------
  // Purchases rendering
  // -----------------------------
  // Función: setPurchasesState()
  const setPurchasesState = (state) => {
    const loading = $("purchasesLoading");
    const empty = $("purchasesEmpty");
    const error = $("purchasesError");
    const grid = $("purchasesGrid");

    // Reset
    hide(loading); hide(empty); hide(error); hide(grid);

    if (state === "loading") show(loading);
    if (state === "empty") show(empty);
    if (state === "error") show(error);
    if (state === "grid") show(grid);
  };

  // Función: purchaseCardHTML()
  const purchaseCardHTML = (p) => {
    const now = Number(p.priceDiscount ?? p.price ?? 0);
    const old = Number(p.price ?? 0);
    const showOld = old && old > now;

    const courseLink = `curso.html?id=${encodeURIComponent(p.courseId)}`;
    // “Detalle” podría ser una modal o compra.html; por ahora dejamos ancla
    const detailLink = courseLink;

    return `
      <article class="tc-purchase tc-reveal">
        <div class="tc-purchase__top">
          <div>
            <h3 class="tc-purchase__title">${safeText(p.title)}</h3>
            <p class="tc-purchase__meta">Orden: <strong>${safeText(p.id)}</strong> · ${safeText(formatDate(p.date))}</p>
          </div>
          <span class="tc-status ${statusClass(p.status)}">${safeText(statusLabel(p.status))}</span>
        </div>

        <div class="tc-purchase__body">
          <div class="tc-price-row">
            <div>
              <div class="tc-price-now">${safeText(formatCLP(now))}</div>
              ${showOld ? `<div class="tc-price-old">${safeText(formatCLP(old))}</div>` : ""}
            </div>
          </div>

          <div class="tc-purchase__actions">
            <a class="tc-link-btn is-primary" href="${courseLink}">Ir al curso →</a>
            <a class="tc-link-btn" href="${detailLink}">Detalle</a>
          </div>
        </div>
      </article>
    `;
  };

  // Función: renderPurchases()
  const renderPurchases = (list) => {
    const grid = $("purchasesGrid");
    if (!grid) return;

    grid.innerHTML = list.map(purchaseCardHTML).join("");

    // Stagger reveal delay
    const cards = Array.from(grid.querySelectorAll(".tc-reveal"));
    cards.forEach((el, i) => el.style.setProperty("--d", `${i * 70}ms`));
    revealOnScroll();
  };

  // Simula “backend”
  const loadPurchases = async () => {
    setPurchasesState("loading");

    try {
      await new Promise(r => setTimeout(r, MOCK_DELAY_MS));

      // Puedes dejarlo vacío si quieres ver el estado "empty"
      const purchases = Array.isArray(MOCK_PURCHASES) ? MOCK_PURCHASES : [];

      if (!purchases.length) {
        setPurchasesState("empty");
        return;
      }

      renderPurchases(purchases);
      setPurchasesState("grid");

      // Stats
      const active = purchases.filter(p => p.status === "paid").length;
      $("statActive").textContent = String(active);
      $("statTotal").textContent = String(purchases.length);
      $("statLast").textContent = formatDate(purchases[0]?.date);

    } catch (e) {
      setPurchasesState("error");
    }
  };

  // -----------------------------
  // Profile (mock)
  // -----------------------------
  // Función: renderProfile()
  const renderProfile = (session) => {
    const name = session?.name || "Usuario Triada";
    const email = session?.email || "usuario@triadacognitiva.com";

    $("profileName").textContent = name;
    $("profileEmail").textContent = email;
    $("profileInitials").textContent = initialsFromName(name);

    // Settings prefill
    const sName = $("settingsName");
    const sEmail = $("settingsEmail");
    if (sName) sName.value = name;
    if (sEmail) sEmail.value = email;
  };

  // -----------------------------
  // Settings mock save
  // -----------------------------
  // Función: initSettings()
  const initSettings = () => {
    const btn = $("saveProfileBtn");
    const note = $("saveProfileNote");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const name = ($("settingsName")?.value || "").trim();
      const email = ($("settingsEmail")?.value || "").trim();

      if (!name || !email) {
        if (note) note.textContent = "Completa nombre y correo para guardar.";
        return;
      }

      // Guarda en sesión mock
      const session = getSession() || {};
      const updated = { ...session, name, email };
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));

      renderProfile(updated);
      if (note) note.textContent = "Cambios guardados (mock).";
      setTimeout(() => { if (note) note.textContent = ""; }, 2200);
    });
  };

  // -----------------------------
  // Init
  // -----------------------------
  // Función: init()
  const init = () => {
    revealOnScroll();
    initTabs();
    initSettings();

    const session = requireSession();
    if (!session) return;

    renderProfile(session);

    const logoutBtn = $("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    const retry = $("retryPurchases");
    if (retry) retry.addEventListener("click", loadPurchases);

    loadPurchases();
  };

// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
  document.addEventListener("DOMContentLoaded", init);
})();