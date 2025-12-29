/***************************************************************************************************
 * scripts/login.js
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

  // ============================
  // SESIÓN (MOCK FRONT)
  // ============================
  // Config: AUTH_KEY -> se usa en este archivo para dirigir rutas / llaves / URLs
  const AUTH_KEY = "tc_session";
  // Config: ACCOUNT_URL -> se usa en este archivo para dirigir rutas / llaves / URLs
  const ACCOUNT_URL = "mi-cuenta.html";

  // Función: getNiceNameFromEmail()
  const getNiceNameFromEmail = (email) => {
    const user = String(email || "").split("@")[0] || "Usuario";
    return user
      .replace(/[._-]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  // Función: saveSession()
  const saveSession = (data) => {
    const payload = {
      name: String(data?.name || "").trim() || getNiceNameFromEmail(data?.email),
      email: String(data?.email || "").trim(),

      // extras registro
      city: String(data?.city || "").trim(),
      country: String(data?.country || "").trim(),
      age: Number(data?.age || 0) || null,
      profession: String(data?.profession || "").trim(),

      createdAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    return payload;
  };

  // Función: hasSession()
  const hasSession = () => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      return !!(s && s.email);
    } catch {
      return false;
    }
  };

  // Función: redirectIfLogged()
  const redirectIfLogged = () => {
    if (hasSession() && location.hash.toLowerCase() !== "#register") {
      window.location.href = ACCOUNT_URL;
    }
  };

  // ============================
  // UI / NAVBAR
  // ============================
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

  // ============================
  // VALIDACIÓN
  // ============================
  // Función: setFieldError()
  const setFieldError = (fieldEl, msg = "") => {
    if (!fieldEl) return;
    const box = fieldEl.closest(".tc-field");
    const msgEl = $(".tc-fieldMsg", box || fieldEl);
    if (!box) return;

    if (msg) {
      box.classList.add("is-error");
      if (msgEl) msgEl.textContent = msg;
    } else {
      box.classList.remove("is-error");
      if (msgEl) msgEl.textContent = "";
    }
  };

  // Función: validateEmail()
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || ""));

  // ============================
  // TABS LOGIN / REGISTER
  // ============================
  // Función: tabs()
  const tabs = () => {
    const tabLogin = $("#tabLogin");
    const tabRegister = $("#tabRegister");
    const panelLogin = $("#panelLogin");
    const panelRegister = $("#panelRegister");

    if (!tabLogin || !tabRegister || !panelLogin || !panelRegister) return;

    // Función: activate()
    const activate = (which) => {
      const isLogin = which === "login";

      tabLogin.classList.toggle("is-active", isLogin);
      tabRegister.classList.toggle("is-active", !isLogin);
      tabLogin.setAttribute("aria-selected", isLogin ? "true" : "false");
      tabRegister.setAttribute("aria-selected", !isLogin ? "true" : "false");

      panelLogin.classList.toggle("is-active", isLogin);
      panelRegister.classList.toggle("is-active", !isLogin);

      const nextHash = isLogin ? "#login" : "#register";
      if (location.hash !== nextHash) history.replaceState(null, "", nextHash);
    };

    tabLogin.addEventListener("click", () => activate("login"));
    tabRegister.addEventListener("click", () => activate("register"));

    $("#goRegister")?.addEventListener("click", (e) => { e.preventDefault(); activate("register"); });
    $("#goLogin")?.addEventListener("click", (e) => { e.preventDefault(); activate("login"); });

    if (location.hash.toLowerCase() === "#register") activate("register");
    else activate("login");
  };

  // Función: passwordToggles()
  const passwordToggles = () => {
    $$("[data-pass-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-pass-toggle");
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPass = input.type === "password";
        input.type = isPass ? "text" : "password";
        btn.textContent = isPass ? "🙈" : "👁️";
      });
    });
  };

  // ============================
  // FORMS
  // ============================
  // Función: forms()
  const forms = () => {
    const loginForm = $("#loginForm");
    const registerForm = $("#registerForm");
    const loginAlert = $("#loginAlert");
    const registerAlert = $("#registerAlert");

    // Función: setAlert()
    const setAlert = (el, type, msg) => {
      if (!el) return;
      el.classList.remove("is-ok", "is-bad");
      if (type) el.classList.add(type === "ok" ? "is-ok" : "is-bad");
      el.textContent = msg || "";
    };

    // LOGIN
    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      setAlert(loginAlert, "", "");

      const emailEl = $("#loginEmail");
      const passEl = $("#loginPass");

      setFieldError(emailEl, "");
      setFieldError(passEl, "");

      const email = emailEl?.value?.trim();
      const pass = passEl?.value || "";

      let ok = true;

      if (!email || !validateEmail(email)) {
        setFieldError(emailEl, "Ingresa un correo válido.");
        ok = false;
      }
      if (!pass || pass.length < 6) {
        setFieldError(passEl, "Tu contraseña debe tener al menos 6 caracteres.");
        ok = false;
      }

      if (!ok) {
        setAlert(loginAlert, "bad", "Revisa los campos marcados.");
        return;
      }

      // DEMO FRONT
      saveSession({
        name: getNiceNameFromEmail(email),
        email
      });

      setAlert(loginAlert, "ok", "Listo ✅ Redirigiendo a Mi Cuenta…");
      setTimeout(() => window.location.href = ACCOUNT_URL, 550);
    });

    // REGISTER
    registerForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      setAlert(registerAlert, "", "");

      const nameEl = $("#regName");
      const last1El = $("#regLast1");
      const last2El = $("#regLast2");
      const emailEl = $("#regEmail");
      const cityEl = $("#regCity");
      const countryEl = $("#regCountry");
      const ageEl = $("#regAge");
      const profEl = $("#regProfession");
      const passEl = $("#regPass");
      const pass2El = $("#regPass2");
      const termsEl = $("#terms");

      [
        nameEl, last1El, last2El,
        emailEl, cityEl, countryEl,
        ageEl, profEl, passEl, pass2El
      ].forEach(el => setFieldError(el, ""));

      const name = nameEl?.value?.trim();
      const last1 = last1El?.value?.trim();
      const last2 = last2El?.value?.trim();
      const email = emailEl?.value?.trim();
      const city = cityEl?.value?.trim();
      const country = countryEl?.value?.trim();
      const age = Number(ageEl?.value || 0);
      const profession = profEl?.value?.trim();
      const pass = passEl?.value || "";
      const pass2 = pass2El?.value || "";
      const terms = !!termsEl?.checked;

      let ok = true;

      if (!name || name.length < 2) { setFieldError(nameEl, "Escribe tu nombre."); ok = false; }
      if (!last1 || last1.length < 2) { setFieldError(last1El, "Ingresa tu primer apellido."); ok = false; }
      if (!last2 || last2.length < 2) { setFieldError(last2El, "Ingresa tu segundo apellido."); ok = false; }

      if (!email || !validateEmail(email)) { setFieldError(emailEl, "Ingresa un correo válido."); ok = false; }

      if (!city || city.length < 2) { setFieldError(cityEl, "Ingresa tu ciudad."); ok = false; }
      if (!country || country.length < 2) { setFieldError(countryEl, "Ingresa tu país."); ok = false; }

      if (!age || Number.isNaN(age) || age < 14 || age > 99) { setFieldError(ageEl, "Edad inválida (14–99)."); ok = false; }

      if (!profession || profession.length < 2) { setFieldError(profEl, "Ingresa tu profesión."); ok = false; }

      if (!pass || pass.length < 6) { setFieldError(passEl, "Mínimo 6 caracteres."); ok = false; }
      if (pass2 !== pass) { setFieldError(pass2El, "Las contraseñas no coinciden."); ok = false; }

      if (!terms) { setAlert(registerAlert, "bad", "Debes aceptar términos y condiciones."); ok = false; }

      if (!ok) return;

      const fullName = `${name} ${last1} ${last2}`.replace(/\s+/g, " ").trim();

      // DEMO FRONT
      saveSession({
        name: fullName,
        email,
        city,
        country,
        age,
        profession
      });

      setAlert(registerAlert, "ok", "Cuenta creada ✅ Redirigiendo a Mi Cuenta…");
      setTimeout(() => window.location.href = ACCOUNT_URL, 650);
    });

    // Forgot (demo)
    $("#forgotLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      setAlert(loginAlert, "ok", "Demo: aquí abrirías el flujo de recuperación de contraseña.");
    });
  };

// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
  document.addEventListener("DOMContentLoaded", () => {
    redirectIfLogged();
    navbarOffsetFix();
    navbarShadowOnScroll();
    revealOnScroll();
    tabs();
    passwordToggles();
    forms();
  });
})();