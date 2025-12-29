/* =================================================================================================
  main.js — Triada Cognitiva
  - Ordenado por secciones según el flujo visual de la página
  - Comentado en español (explicación clara y detallada)
  - NO se elimina código ni se modifica lógica/comportamiento
================================================================================================= */



/* =================================================================================================
  01) NAVBAR “STICKY” (Sombra/estilo al hacer scroll)
  - Se aplica sobre: <header class="navbar">
  - Objetivo: cuando bajas un poco, agrega una sombra/clase para “elevar” visualmente el navbar
================================================================================================= */

// Selecciona el navbar principal (si existe en la página)
const nav = document.querySelector(".navbar");

// Evento global de scroll: se dispara cada vez que el usuario hace scroll
window.addEventListener("scroll", () => {
  // Guardia: si no existe .navbar (por ejemplo en otra página), salimos para evitar error
  if (!nav) return;

  // Toggle de clase:
  // - Si window.scrollY > 12 => agrega "is-scrolled"
  // - Si window.scrollY <= 12 => quita "is-scrolled"
  // Esto permite que el CSS cambie la apariencia (sombra, blur, etc.)
  nav.classList.toggle("is-scrolled", window.scrollY > 12);
});



/* =================================================================================================
  02) REVEALS / ANIMACIONES AL HACER SCROLL (IntersectionObserver)
  - Se usa para: .reveal-left y .reveal-up
  - Objetivo: agregar clases cuando un bloque entra al viewport (aparece con animación)
================================================================================================= */

// COMMIT: scroll reveal de izquierda
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener("DOMContentLoaded", () => {
  // Selecciona todos los elementos que deben aparecer “desde la izquierda”
  // Ej: secciones con clase .reveal-left
  const leftReveals = document.querySelectorAll(".reveal-left");

  // Crea un IntersectionObserver:
  // - Observa cuando cada elemento entra en pantalla
  // - Cuando entra, agrega una clase que activa animación CSS
  const observer = new IntersectionObserver(
    entries => {
      // entries = lista de elementos observados que cambiaron su visibilidad
      entries.forEach(entry => {
        // entry.isIntersecting = true cuando el elemento está dentro del viewport
        if (entry.isIntersecting) {
          // Agrega clase que normalmente define el “estado final” (visible)
          // El CSS suele tener transición desde oculto -> visible
          entry.target.classList.add("show-left");
        }
      });
    },
    {
      // threshold: 0.2 => el callback se dispara cuando ~20% del elemento está visible
      threshold: 0.2
    }
  );

  // Activa la observación en cada elemento encontrado
  leftReveals.forEach(el => observer.observe(el));
});

// COMMIT: scroll reveal hacia arriba
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener("DOMContentLoaded", () => {
  // Selecciona todos los elementos que deben aparecer “desde abajo hacia arriba”
  // Ej: .reveal-up
  const revealsUp = document.querySelectorAll(".reveal-up");

  // Observer para el efecto “reveal-up”
  const observerUp = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        // Cuando el elemento entra al viewport, se activa el estado “visible”
        if (entry.isIntersecting) {
          // Clase que dispara la animación en CSS
          entry.target.classList.add("show-up");
        }
      });
    },
    {
      // Igual que el anterior: dispara al estar 20% visible
      threshold: 0.2
    }
  );

  // Se observa cada elemento con clase .reveal-up
  revealsUp.forEach(el => observerUp.observe(el));
});



/* =================================================================================================
  03) CATEGORÍAS DE CURSOS (Tabs: Populares / Lanzamientos / Valorados)
  - Se usa en la sección “EXPLORA NUESTROS PROGRAMAS”
  - Objetivo: al hacer click en botones, mostrar/ocultar categorías y re-disparar animación
================================================================================================= */

// COMMIT: cambio de categoría + animación
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener("DOMContentLoaded", () => {
  // Botones del bloque “EXPLORA NUESTROS PROGRAMAS”
  // (cada botón debería tener texto: “Más Populares”, “Nuevos Lanzamientos”, etc.)
  const buttons = document.querySelectorAll(".program-btn");

  // Contenedores de categorías
  // (cada uno debería ser algo como: <div class="category" data-category="populares">...</div>)
  const categories = document.querySelectorAll(".category");

  // A cada botón le asignamos el evento click
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Leemos el texto visible del botón para saber qué “tab” fue seleccionado
      // trim() elimina espacios extra
      const selected = btn.textContent.trim();

      // 1) Marcar visualmente el botón activo
      //    - Primero quitamos .active a todos
      //    - Luego lo agregamos solo al botón clickeado
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 2) Ocultar todas las categorías y reiniciar animación
      categories.forEach(cat => {
        // .hidden normalmente es display:none (o similar)
        cat.classList.add("hidden");

        // .animate-in dispara animación de entrada para las cards
        // Lo quitamos para poder re-agregarlo y reiniciar la animación
        cat.classList.remove("animate-in");
      });

      // 3) Buscar la categoría objetivo según:
      //    - El texto del botón seleccionado
      //    - El data-category del contenedor
      const target = [...categories].find(cat =>
        (selected === "Más Populares" && cat.dataset.category === "populares") ||
        (selected === "Nuevos Lanzamientos" && cat.dataset.category === "lanzamientos") ||
        (selected === "Mejores Valorados" && cat.dataset.category === "valorados")
      );

      // 4) Si existe la categoría, la mostramos y re-disparamos la animación
      if (target) {
        // La hacemos visible quitando .hidden
        target.classList.remove("hidden");

        // Forzar reflow:
        // - void target.offsetWidth fuerza al navegador a “recalcular” layout
        // - Esto permite que al volver a agregar la clase, la animación CSS se reinicie
        void target.offsetWidth;

        // Activa animación de entrada (según tu CSS)
        target.classList.add("animate-in");
      }
    });
  });
});



/* =================================================================================================
  04) INFO SLIDER (Beneficios rotativos bajo el hero)
  - Se usa en: <section class="info-slider"> con ids:
    #infoSliderItem, #infoSliderIcon, #infoSliderText
  - Objetivo: rotar 3 mensajes con íconos, sincronizados con animación CSS (animationend)
================================================================================================= */

// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  // 1) Referencias a elementos del DOM por ID
  const item = document.getElementById("infoSliderItem");   // contenedor animado (entra/espera/sale)
  const icon = document.getElementById("infoSliderIcon");   // contenedor donde se inyecta el SVG
  const text = document.getElementById("infoSliderText");   // contenedor de texto del mensaje

  // Si alguno no existe, salimos para evitar errores (por ejemplo en páginas sin este bloque)
  if (!item || !icon || !text) return;

  // 2) Definimos las “diapositivas” del slider (texto + icono SVG en string)
  const slides = [
    {
      text: "Nuevos cursos y talleres todos los meses.",
      icon: `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7l8-4 8 4-8 4-8-4Z" stroke="#0B1220" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M6 10v6c0 2 12 2 12 0v-6" stroke="#0B1220" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M20 9v4" stroke="#0B1220" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `
    },
    {
      text: "Obtén un certificado de acreditación y participación.",
      icon: `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3h10v12H7V3Z" stroke="#0B1220" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M9 7h6" stroke="#0B1220" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M9 10h6" stroke="#0B1220" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M10 21l2-1 2 1v-6h-4v6Z" stroke="#0B1220" stroke-width="1.6" stroke-linejoin="round"/>
        </svg>
      `
    },
    {
      text: "Aprende desde cualquier lugar del planeta.",
      icon: `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16v10H4V6Z" stroke="#0B1220" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M8 20h8" stroke="#0B1220" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M10 16v4" stroke="#0B1220" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M14 16v4" stroke="#0B1220" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `
    }
  ];

  // 3) Índice actual de slide
  let i = 0;

  // 4) Función que “reproduce” una slide:
  //    - Inyecta icono y texto
  //    - Reinicia la animación CSS agregando y quitando la clase
  function playSlide(index){
    // Inserta el SVG en el contenedor del ícono
    icon.innerHTML = slides[index].icon;

    // Inserta el texto plano en el contenedor del texto
    text.textContent = slides[index].text;

    // Reinicia animación:
    // - Quitamos clase que dispara @keyframes
    // - Forzamos reflow
    // - Volvemos a agregar la clase
    item.classList.remove("is-animating");
    void item.offsetWidth; // fuerza reflow (recalcular layout)
    item.classList.add("is-animating");
  }

  // 5) Cuando termina la animación CSS del item (cycle completo),
  //    avanzamos a la siguiente slide y la reproducimos
  item.addEventListener("animationend", () => {
    // i = (i + 1) % slides.length => loop infinito: 0 -> 1 -> 2 -> 0...
    i = (i + 1) % slides.length;
    playSlide(i);
  });

  // 6) Arranque inicial del slider (primera slide)
  playSlide(i);
})();



/* =================================================================================================
  05) SECCIÓN “¿POR QUÉ NOS ELIGEN?” (tc-why) — Reveal propio (tc-reveal)
  - Se usa en elementos con clase: .tc-reveal
  - Objetivo: cuando un bloque entra al viewport, agrega .is-visible y deja de observarlo
================================================================================================= */

// =======================
// Animación reveal al hacer scroll (sin librerías)
// =======================
(function(){
  // Selecciona todos los elementos de esta sección (y sub-bloques) que deben “aparecer”
  const els = document.querySelectorAll('.tc-reveal');

  // Si no hay elementos, salimos (evita trabajo extra y posibles errores)
  if(!els.length) return;

  // IntersectionObserver para revelar cuando el elemento entra a pantalla
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      // Si el elemento ya es visible (entró al viewport)
      if(e.isIntersecting){
        // Agrega clase que cambia opacity/transform en CSS
        e.target.classList.add('is-visible');

        // Deja de observar ese elemento para:
        // - Mejor performance
        // - Evitar que se “re-oculte” o se re-dispare
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 }); // 12% visible para disparar

  // Observa cada elemento tc-reveal
  els.forEach(el => io.observe(el));
})();



/* =================================================================================================
  06) TESTIMONIOS (Ticker continuo — track duplicado + cálculo de duración)
  - Se usa en:
    #testiViewport (contenedor “ventana”)
    #testiTrack    (cinta que se mueve)
  - Objetivo:
    1) Duplicar las cards 1 vez para loop infinito
    2) Calcular distancia y duración según ancho real (responsive) y velocidad
    3) Actualizar al load y resize
================================================================================================= */

// =======================
// Testimonios ticker continuo
// =======================
// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  // Referencias a los nodos del ticker
  const track = document.getElementById("testiTrack");
  const viewport = document.getElementById("testiViewport");

  // Si no existen, se sale (ej: otra página sin testimonios)
  if(!track || !viewport) return;

  // Velocidad del ticker (px por segundo)
  // - Más alto => más rápido
  const SPEED_PX_PER_SEC = 55;

  // Duplica 1 vez el set original:
  // - Se toman los hijos actuales (cards reales)
  // - Se clonan y se agregan al final
  // - Resultado: track tiene 2 sets iguales back-to-back
  const originals = Array.from(track.children);
  originals.forEach(card => track.appendChild(card.cloneNode(true)));

  // Función que calcula:
  // - Distancia que debe recorrer el ticker (half)
  // - Duración en segundos según velocidad (half / SPEED)
  // - Variables CSS que usa @keyframes (distance y duration)
  // Función: apply()
  const apply = () => {
    // “half” = ancho del set original
    // Como duplicamos una vez, scrollWidth total = 2 * original => mitad = original
    const half = track.scrollWidth / 2;

    // Duración en segundos:
    // - half / SPEED => tiempo para recorrer la distancia a esa velocidad
    // - Math.max(12, ...) => nunca menos de 12s (evita demasiado rápido)
    const duration = Math.max(12, half / SPEED_PX_PER_SEC);

    // Variables CSS usadas en el keyframe:
    // --ticker-distance: distancia total a mover hacia la izquierda
    // --ticker-duration: duración del loop
    track.style.setProperty("--ticker-distance", half + "px");
    track.style.setProperty("--ticker-duration", duration + "s");
  };

  // Al cargar:
  // - se espera un poquito para asegurar que el layout y fuentes estén listas
  window.addEventListener("load", () => setTimeout(apply, 50));

  // Al redimensionar:
  // - recalcula, pero con debounce simple usando window.__tst
  window.addEventListener("resize", () => {
    clearTimeout(window.__tst);
    window.__tst = setTimeout(apply, 120);
  });

  // Re-aplica de nuevo “por si acaso” (fonts/imagenes pueden cambiar medidas tardíamente)
  setTimeout(apply, 200);
})()



/* =================================================================================================
  07) TOP 10 SEMANAL (Carrusel horizontal + navegación)
  - Se usa en:
    .top10-carousel (contenedor scrolleable)
    .top10-nav.left / .top10-nav.right (botones)
  - Objetivo:
    1) Mover el carrusel a izquierda/derecha con scrollBy()
    2) Incluye un observer adicional para .reveal-up (bloque repetido intencionalmente)
================================================================================================= */

// COMMIT: Top10 scroll nav
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener("DOMContentLoaded", () => {
  // Contenedor que scrollea horizontalmente
  const carousel = document.querySelector(".top10-carousel");

  // Botones de navegación
  const btnLeft = document.querySelector(".top10-nav.left");
  const btnRight = document.querySelector(".top10-nav.right");

  // Click izquierda: desplaza el carrusel hacia la izquierda 300px suavemente
  btnLeft.addEventListener("click", () => {
    carousel.scrollBy({ left: -300, behavior: "smooth" });
  });

  // Click derecha: desplaza el carrusel hacia la derecha 300px suavemente
  btnRight.addEventListener("click", () => {
    carousel.scrollBy({ left: 300, behavior: "smooth" });
  });

  // COMMIT: fade-in reveal observer
  // NOTA: Este bloque “repite” la lógica de reveal-up, pero solo para el primer .reveal-up encontrado.
  // No lo elimino porque podría cambiar el comportamiento en tu proyecto actual.
  const revealUp = document.querySelector(".reveal-up");

  const observerUp = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show-up");
        }
      });
    },
    { threshold: 0.2 }
  );

  // Solo observamos si existe el elemento
  if (revealUp) observerUp.observe(revealUp);
});



/* =================================================================================================
  08) SECCIÓN INTERACTIVA (Botones que cambian imagen + animación)
  - Se usa en:
    .interactive-btn (botones)
    #interactive-image (imagen que cambia)
  - Objetivo:
    1) Marcar botón activo
    2) Hacer fade-out + scale, cambiar src, luego fade-in + scale normal
================================================================================================= */

// COMMIT: comportamiento interactivo de la sección
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener("DOMContentLoaded", () => {
  // Botones de la izquierda (cada botón debe tener data-img="algo")
  const buttons = document.querySelectorAll(".interactive-btn");

  // Imagen de la derecha que se va actualizando
  const interactiveImage = document.getElementById("interactive-image");

  // Asigna evento click a cada botón
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      // 1) Cambiar estado activo:
      //    - quitamos .active de todos
      //    - agregamos .active al botón actual
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 2) Animación de salida:
      //    - baja opacidad (fade-out)
      //    - reduce escala (zoom out sutil)
      interactiveImage.style.opacity = "0";
      interactiveImage.style.transform = "scale(0.95)";

      // 3) Espera 300ms para que se vea el efecto de salida,
      //    luego cambia el src y vuelve a mostrar (fade-in + scale normal)
      setTimeout(() => {
        // Lee la clave de imagen desde atributo data-img del botón
        const imgKey = btn.getAttribute("data-img");

        // Cambia la ruta de la imagen (asume assets/images/{imgKey}.jpg)
        interactiveImage.src = `assets/images/${imgKey}.jpg`;

        // Animación de entrada:
        // - vuelve a opacidad 1
        // - vuelve a escala 1
        interactiveImage.style.opacity = "1";
        interactiveImage.style.transform = "scale(1)";
      }, 300);

    });
  });
});

/* =================================================================================================
  FEATURED COURSES — Reveal + Tilt suave
================================================================================================= */
// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  const section = document.getElementById("cursos-destacados");
  if (!section) return;

  /* ---------------------------
    1) Reveal al hacer scroll
  ---------------------------- */
  const reveals = section.querySelectorAll(".fc-reveal");
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14 });

    reveals.forEach(el => io.observe(el));
  }

  /* ---------------------------
    2) Tilt suave en cards
    - Muy leve para que no sea “molesto”
    - Se desactiva en pantallas táctiles
  ---------------------------- */
  const isTouch =
    "ontouchstart" in window ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  if (isTouch) return;

  const cards = section.querySelectorAll(".fc-card");
  cards.forEach((card) => {
    const strength = 6; // menor = más sutil (recomendado 4–8)

    function onMove(ev) {
      const r = card.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width;  // 0..1
      const y = (ev.clientY - r.top) / r.height;  // 0..1

      // mapea a -1..1
      const dx = (x - 0.5) * 2;
      const dy = (y - 0.5) * 2;

      // rota levemente
      const ry = dx * strength;
      const rx = -dy * strength;

      card.style.setProperty("--rx", rx.toFixed(2) + "deg");
      card.style.setProperty("--ry", ry.toFixed(2) + "deg");
    }

    function onLeave() {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  });
})();



/* =================================================================================================
  09) TESTIMONIOS (Carrusel “paginado” de 3 en 3 + autoplay)
  - Se usa en la versión antigua con:
    .testimonials-carousel y botones .testi-nav.left / .testi-nav.right
  - Objetivo:
    1) Avanzar/retroceder en “páginas” de 3 cards
    2) Autoplay cada 5s hasta el final, luego vuelve al inicio
    3) Al usar flechas, se detiene el autoplay
================================================================================================= */

// COMMIT: testimonios carousel 3 en 3
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener("DOMContentLoaded", () => {
  // Contenedor del carrusel de testimonios
  const carousel = document.querySelector(".testimonials-carousel");

  // Botones de navegación
  const btnLeft = document.querySelector(".testi-nav.left");
  const btnRight = document.querySelector(".testi-nav.right");

  // Calcula el ancho de una tarjeta + el gap (25px según tu CSS)
  // Nota: depende de que exista al menos 1 hijo dentro del carrusel
  const itemWidth = carousel.children[0].getBoundingClientRect().width + 25;
  // ancho de 1 testimonial + gap

  // pageIndex = “página” actual (0 = primera)
  let pageIndex = 0;

  // Cantidad de elementos que se muestran por “página”
  const itemsPerPage = 3;

  // Máximo índice de páginas (aprox)
  const maxIndex = Math.floor(carousel.children.length / itemsPerPage);

  // Flecha derecha: avanza una “página”
  btnRight.addEventListener("click", () => {
    // Solo avanza si aún no llegamos al final
    if (pageIndex < maxIndex) {
      pageIndex++;

      // scrollTo mueve el contenedor a una posición exacta
      // left = pageIndex * itemsPerPage * itemWidth
      carousel.scrollTo({
        left: pageIndex * itemsPerPage * itemWidth,
        behavior: "smooth"
      });
    }
  });

  // Flecha izquierda: retrocede una “página”
  btnLeft.addEventListener("click", () => {
    // Solo retrocede si no estamos en la primera página
    if (pageIndex > 0) {
      pageIndex--;

      carousel.scrollTo({
        left: pageIndex * itemsPerPage * itemWidth,
        behavior: "smooth"
      });
    }
  });

  // Opcional: autoplay cada 5s
  // Va avanzando automáticamente hasta el final y vuelve al inicio.
  let auto = setInterval(() => {
    // Si no estamos al final, avanzamos; si no, volvemos a 0
    if (pageIndex < maxIndex) {
      pageIndex++;
    } else {
      pageIndex = 0;
    }

    carousel.scrollTo({
      left: pageIndex * itemsPerPage * itemWidth,
      behavior: "smooth"
    });
  }, 5000);

  // Al usar flechas: se detiene el autoplay (evita “pelear” con el usuario)
  btnLeft.addEventListener("click", () => clearInterval(auto));
  btnRight.addEventListener("click", () => clearInterval(auto));
});

//----------------------------------------------------------------



/* =================================================================================================
  10) CORPORATE LOGIN FORM (Clase completa)
  - Este bloque corresponde a una página/formulario distinto (login corporativo)
  - Maneja:
    • Validación de email corporativo
    • Validación fuerte de contraseña
    • Toggle mostrar/ocultar contraseña
    • Botones SSO (Azure / Okta)
    • Simulación de login + éxito
================================================================================================= */

// Corporate Login Form JavaScript
class CorporateLoginForm {
    constructor() {
        // Form principal (se asume que existe en el HTML correspondiente)
        this.form = document.getElementById('loginForm');

        // Inputs principales
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');

        // Botón/ícono para mostrar/ocultar contraseña
        this.passwordToggle = document.getElementById('passwordToggle');

        // Botón de submit (dentro del form, clase .login-btn)
        this.submitButton = this.form.querySelector('.login-btn');

        // Mensaje de éxito (se muestra al autenticar)
        this.successMessage = document.getElementById('successMessage');

        // Botones SSO (ej: Azure / Okta)
        this.ssoButtons = document.querySelectorAll('.sso-btn');
        
        // Inicializa configuración y eventos
        this.init();
    }
    
    init() {
        // 1) Enlaza eventos del form e inputs
        this.bindEvents();

        // 2) Configura el toggle “mostrar/ocultar” contraseña
        this.setupPasswordToggle();

        // 3) Configura comportamiento de botones SSO
        this.setupSSOButtons();
    }
    
    bindEvents() {
        // Submit del formulario:
        // - Evita recarga de página
        // - Ejecuta validaciones y simula autenticación
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validación al “salir” del input (blur)
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());

        // Limpia errores mientras el usuario escribe
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
    }
    
    setupPasswordToggle() {
        // Click del toggle:
        // - Cambia el type del input entre password/text
        // - Actualiza icono con clase .show-password
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            
            // Cambia clase del ícono (por CSS) según estado
            const icon = this.passwordToggle.querySelector('.toggle-icon');
            icon.classList.toggle('show-password', type === 'text');
        });
    }
    
    setupSSOButtons() {
        // Recorre botones SSO para asignarles click
        this.ssoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Detecta proveedor según clase (azure-btn u okta-btn)
                const provider = button.classList.contains('azure-btn') ? 'Azure AD' : 'Okta';
                this.handleSSOLogin(provider);
            });
        });
    }
    
    validateEmail() {
        // Obtiene valor limpio (sin espacios)
        const email = this.emailInput.value.trim();

        // Regex: exige extensión corporativa común
        // (ej: .com, .org, .net, .edu, .gov, .mil)
        const businessEmailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|edu|gov|mil)$/i;
        
        // Regla: requerido
        if (!email) {
            this.showError('email', 'Business email is required');
            return false;
        }
        
        // Regla: formato válido
        if (!businessEmailRegex.test(email)) {
            this.showError('email', 'Please enter a valid business email address');
            return false;
        }
        
        // Regla: bloquear dominios personales típicos
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

        // Extrae dominio (parte posterior al @)
        const domain = email.split('@')[1]?.toLowerCase();

        // Si es un dominio personal, error
        if (personalDomains.includes(domain)) {
            this.showError('email', 'Please use your business email address');
            return false;
        }
        
        // OK: limpia error y confirma validación
        this.clearError('email');
        return true;
    }
    
    validatePassword() {
        // Obtiene password tal como está
        const password = this.passwordInput.value;
        
        // Regla: requerido
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
        
        // Regla: mínimo 8 caracteres
        if (password.length < 8) {
            this.showError('password', 'Password must be at least 8 characters');
            return false;
        }
        
        // Reglas de complejidad (corporativa):
        // - al menos una mayúscula
        // - al menos una minúscula
        // - al menos un número
        // - al menos un carácter especial
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        // Si falla cualquiera, error
        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            this.showError('password', 'Password must contain uppercase, lowercase, number, and special character');
            return false;
        }
        
        // OK: limpia error
        this.clearError('password');
        return true;
    }
    
    showError(field, message) {
        // Ubica el contenedor del input (form-group) para marcarlo con estilo de error
        const formGroup = document.getElementById(field).closest('.form-group');

        // Elemento que mostrará el error (ej: emailError / passwordError)
        const errorElement = document.getElementById(`${field}Error`);
        
        // Aplica estilos de error
        formGroup.classList.add('error');

        // Inserta el mensaje
        errorElement.textContent = message;

        // Muestra el error (clase CSS .show)
        errorElement.classList.add('show');
    }
    
    clearError(field) {
        // Obtiene form-group para quitar estado de error
        const formGroup = document.getElementById(field).closest('.form-group');

        // Obtiene el label/mensaje de error
        const errorElement = document.getElementById(`${field}Error`);
        
        // Quita estilos visibles
        formGroup.classList.remove('error');
        errorElement.classList.remove('show');

        // Borra el texto con delay (para no cortar animación CSS de salida)
        setTimeout(() => {
            errorElement.textContent = '';
        }, 300);
    }
    
    async handleSubmit(e) {
        // Evita recargar la página
        e.preventDefault();
        
        // Ejecuta validaciones
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        // Si una falla, se detiene el submit
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        // Activa estado loading
        this.setLoading(true);
        
        try {
            // Simula autenticación (espera 2s)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Si todo bien, muestra éxito
            this.showSuccess();
        } catch (error) {
            // Si algo falla en la simulación, muestra error genérico
            this.showError('password', 'Authentication failed. Please contact IT support.');
        } finally {
            // Apaga loading sí o sí
            this.setLoading(false);
        }
    }
    
    async handleSSOLogin(provider) {
        // Debug: indica en consola proveedor
        console.log(`Initiating SSO login with ${provider}...`);
        
        // Selecciona el botón del proveedor:
        // - convierte provider a clase (ej: "Azure AD" -> "azure-ad-btn")
        const ssoButton = document.querySelector(`.${provider.toLowerCase().replace(' ', '-')}-btn`);

        // Feedback: baja opacidad y bloquea interacción
        ssoButton.style.opacity = '0.6';
        ssoButton.style.pointerEvents = 'none';
        
        try {
            // Simula tiempo de red/redirect
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`Redirecting to ${provider} authentication...`);

            // Redirección real (comentada en tu código)
            // window.location.href = `/auth/${provider.toLowerCase()}`;
        } catch (error) {
            // Log de error en consola (modo debug)
            console.error(`SSO authentication failed: ${error.message}`);
        } finally {
            // Restaura el botón a su estado normal
            ssoButton.style.opacity = '1';
            ssoButton.style.pointerEvents = 'auto';
        }
    }
    
    setLoading(loading) {
        // Marca el botón como loading (para estilos) y lo deshabilita
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
        
        // Deshabilita también botones SSO mientras está cargando
        this.ssoButtons.forEach(button => {
            button.style.pointerEvents = loading ? 'none' : 'auto';
            button.style.opacity = loading ? '0.6' : '1';
        });
    }
    
    showSuccess() {
        // Oculta el form
        this.form.style.display = 'none';

        // Oculta opciones relacionadas (asume que existen en el HTML del login)
        document.querySelector('.sso-options').style.display = 'none';
        document.querySelector('.footer-links').style.display = 'none';

        // Muestra el mensaje de éxito
        this.successMessage.classList.add('show');
        
        // Simula redirección posterior
        setTimeout(() => {
            console.log('Redirecting to corporate workspace...');
            // window.location.href = '/workspace';
        }, 3000);
    }
}

// Inicializa el login cuando el DOM está listo
// Inicialización: esperamos que el DOM esté listo antes de buscar elementos y asignar eventos.
document.addEventListener('DOMContentLoaded', () => {
    // Crea la instancia que “enciende” toda la lógica del login
    new CorporateLoginForm();
});



// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  // Función: apply()
  const apply = () => {
    document.body.style.paddingTop = nav.offsetHeight + "px";
  };

  window.addEventListener("load", apply);
  window.addEventListener("resize", apply);
  apply();
})();

/* =================================================================================================
  FAQ (Preguntas frecuentes) — Acordeón + animación de aparición
================================================================================================= */
// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  const items = document.querySelectorAll(".tc-faq-item");
  if (!items.length) return;

  // 1) Animación de entrada en cascada (cuando aparecen)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;

      // “Cascada” suave según orden
      items.forEach((it, idx) => {
        if (it.classList.contains("is-in")) return;
        setTimeout(() => it.classList.add("is-in"), idx * 70);
      });

      io.disconnect();
    });
  }, { threshold: 0.15 });

  io.observe(items[0]);

  // 2) Acordeón (abre/cierra). Mantiene 1 abierto a la vez (pro look).
  items.forEach((item) => {
    const btn = item.querySelector(".tc-faq-q");
    const panel = item.querySelector(".tc-faq-a");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Cierra todos
      items.forEach((other) => {
        other.classList.remove("is-open");
        const b = other.querySelector(".tc-faq-q");
        if (b) b.setAttribute("aria-expanded", "false");
      });

      // Si no estaba abierto, abre este
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
})();

/* =================================================================================================
  CONTACTO — Formulario que abre mailto + validación suave
================================================================================================= */
// IIFE: encapsula variables/funciones para no contaminar el scope global.
(() => {
  const form = document.getElementById("tcContactForm");
  if (!form) return;

  const note = document.getElementById("tcContactNote");

  const fields = {
    name: form.querySelector("#tcName"),
    email: form.querySelector("#tcEmail"),
    topic: form.querySelector("#tcTopic"),
    message: form.querySelector("#tcMsg")
  };

  const emailTo = "info@adipa.cl"; // <- cambia aquí si quieres

  // Función: setFieldError()
  const setFieldError = (el, on) => {
    const wrap = el?.closest(".tc-field");
    if (!wrap) return;
    wrap.classList.toggle("is-error", !!on);
  };

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

  // Función: clearNote()
  const clearNote = () => {
    if (!note) return;
    note.textContent = "";
  };

  // Función: setNote()
  const setNote = (txt) => {
    if (!note) return;
    note.textContent = txt;
  };

  // Limpia errores al escribir
  Object.values(fields).forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      setFieldError(el, false);
      clearNote();
    });
    el.addEventListener("change", () => {
      setFieldError(el, false);
      clearNote();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const topic = fields.topic.value;
    const message = fields.message.value.trim();

    let ok = true;

    if (!name) { setFieldError(fields.name, true); ok = false; }
    if (!email || !isValidEmail(email)) { setFieldError(fields.email, true); ok = false; }
    if (!topic) { setFieldError(fields.topic, true); ok = false; }
    if (!message) { setFieldError(fields.message, true); ok = false; }

    if (!ok) {
      setNote("Revisa los campos marcados para poder enviar tu mensaje.");
      return;
    }

    const subject = `Contacto — ${topic}`;
    const body =
`Hola Triada Cognitiva,

Mi nombre es: ${name}
Mi correo es: ${email}

Consulta:
${message}

Saludos.`;

    const mailto = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Feedback suave antes de abrir el correo
    setNote("Abriendo tu correo para enviar el mensaje…");

    setTimeout(() => {
      window.location.href = mailto;
    }, 200);
  });
})();