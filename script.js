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
// ── Renderizar items del carrito ─────────────────────────────
function renderCart() {
  // 1. Actualizar contador de burbuja (cantidad de productos)
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;
}
  // 2. Calcular Dinero Total (suma de precios)
  const totalMoney = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  
  // Actualizar el número en el HTML (el que agregamos recién)
  const totalPriceElement = document.getElementById('total-price');
  if (totalPriceElement) {
    totalPriceElement.textContent = totalMoney.toLocaleString('es-AR');
  }

  // Vaciar contenedor de items
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Todavía no agregaste productos.</p>';
    cartSend.style.opacity = '0.4';
    cartSend.style.pointerEvents = 'none';
    // Ocultar botón de MP si está vacío
    if(document.getElementById('checkout-btn')) document.getElementById('checkout-btn').style.display = 'none';
    return;
  }

  cartSend.style.opacity = '1';
  cartSend.style.pointerEvents = 'all';
  if(document.getElementById('checkout-btn')) document.getElementById('checkout-btn').style.display = 'block';

  cart.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${Number(item.price).toLocaleString('es-AR')} c/u</div>
      </div>
      <div class="cart-item-controls">
        <button data-index="${index}" class="qty-minus">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button data-index="${index}" class="qty-plus">+</button>
      </div>
    `;
    cartItems.appendChild(el);
  });

  // Re-vincular botones de cantidad (esto ya lo tenías bien)
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
// ── Agregar producto al carrito ──────────────────────────────
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    // Capturamos el precio que pusiste en el HTML
    const price = parseFloat(btn.dataset.price) || 0; 

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      // Guardamos el precio real en el objeto
      cart.push({ name, price, qty: 1 });
    }

    // Feedback visual (opcional)
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


// ── Init ─────────────────────────────────────────────────────
renderCart();

async function irAPagar() {
    if (cart.length === 0) return alert("El carrito está vacío");

    const btnPago = document.getElementById('checkout-btn');
    btnPago.innerText = "Cargando pago...";
    btnPago.style.opacity = "0.5";

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart }) // 'cart' es tu array de productos
        });

        const data = await response.json();

        if (data.init_point) {
            window.location.href = data.init_point; // Redirige a Mercado Pago
        } else {
            alert("Error al generar el pago");
            btnPago.innerText = "Pagar con Mercado Pago";
            btnPago.style.opacity = "1";
        }
    } catch (err) {
        console.error(err);
        alert("Hubo un problema de conexión");
        btnPago.innerText = "Pagar con Mercado Pago";
        btnPago.style.opacity = "1";
    }
}