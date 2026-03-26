/* ============================================================
   FTM.e.d.m — CARRITO DE PEDIDOS
   ============================================================
   Permite acumular productos y enviar el pedido por WhatsApp.
   No requiere ninguna configuración adicional.
   ============================================================ */

const WA_NUMBER = '3813000379';

// ── Estado del carrito ──────────────────────────────────────
let cart = [];

// ── Referencias al DOM ──────────────────────────────────────
const cartBtn     = document.getElementById('cartBtn');
const cartCount   = document.getElementById('cartCount');
const cartDrawer  = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose   = document.getElementById('cartClose');
const cartItems   = document.getElementById('cartItems');
const cartSend    = document.getElementById('cartSend');
const cartClear   = document.getElementById('cartClear');

// ── Abrir / cerrar carrito ───────────────────────────────────
function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ── Selector de variantes ────────────────────────────────────
document.querySelectorAll('.product-card').forEach(card => {
  const variantes = card.querySelectorAll('.variante');
  const carousel  = card.querySelector('.carousel');
  const addBtn    = card.querySelector('.add-to-cart');
  const baseName  = card.querySelector('h5')?.textContent.trim();

  if (!variantes.length) return;

  variantes.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar activo
      variantes.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mover carrusel a la foto correspondiente
      if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const dots  = carousel.querySelectorAll('.dot');
        const index = parseInt(btn.dataset.index);
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      }

      // Actualizar data-name con la variante seleccionada
      if (addBtn) {
        addBtn.dataset.name = `${baseName} - ${btn.textContent.trim()}`;
      }
    });
  });
});

// ── Agregar producto al carrito ──────────────────────────────
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    const price = btn.dataset.price;

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    // Feedback visual en el botón
    btn.textContent = '✓ Agregado';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ Agregar al pedido';
      btn.classList.remove('added');
    }, 1500);

    renderCart();
    openCart();
  });
});

// ── Renderizar items del carrito ─────────────────────────────
function renderCart() {
  // Actualizar contador
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = total;

  // Vaciar contenedor
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Todavía no agregaste productos.</p>';
    cartSend.style.opacity = '0.4';
    cartSend.style.pointerEvents = 'none';
    return;
  }

  cartSend.style.opacity = '1';
  cartSend.style.pointerEvents = 'all';

  cart.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} c/u</div>
      </div>
      <div class="cart-item-controls">
        <button data-index="${index}" class="qty-minus">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button data-index="${index}" class="qty-plus">+</button>
      </div>
    `;
    cartItems.appendChild(el);
  });

  // Botones de cantidad
  cartItems.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      renderCart();
    });
  });

  cartItems.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      cart[i].qty += 1;
      renderCart();
    });
  });

  // Armar link de WhatsApp
  buildWhatsAppLink();
}

// ── Armar mensaje de WhatsApp ────────────────────────────────
function buildWhatsAppLink() {
  if (cart.length === 0) return;

  let mensaje = '¡Hola! Me gustaría consultar por los siguientes productos:\n\n';
  cart.forEach(item => {
    mensaje += `• ${item.name} x${item.qty}\n`;
  });
  mensaje += '\n¿Tienen disponibilidad?';

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  cartSend.href = url;
}

// ── Vaciar carrito ───────────────────────────────────────────
cartClear.addEventListener('click', () => {
  cart = [];
  renderCart();
});

// ── Carrusel táctil ──────────────────────────────────────────
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const dots  = carousel.querySelectorAll('.dot');
  if (!track) return;

  let index     = 0;
  let startX    = 0;
  let isDragging = false;

  function goTo(i) {
    const total = track.children.length;
    if (total <= 1) return;
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('active', j === index));
  }

  // Ocultar dots si hay una sola imagen
  if (track.children.length <= 1) {
    const dotsContainer = carousel.querySelector('.carousel-dots');
    if (dotsContainer) dotsContainer.style.display = 'none';
  }

  // Touch (celular)
  carousel.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? index + 1 : index - 1);
  }, { passive: true });

  // Mouse (desktop)
  carousel.addEventListener('mousedown', e => {
    startX = e.clientX;
    isDragging = true;
    carousel.classList.add('dragging');
  });
  carousel.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('dragging');
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? index + 1 : index - 1);
  });
  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
    carousel.classList.remove('dragging');
  });
});

// ── Init ─────────────────────────────────────────────────────
renderCart();

