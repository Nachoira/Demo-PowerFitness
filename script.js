/* ============================================================
   FTM.e.d.m — CARRITO DE PEDIDOS + MERCADO PAGO
   ============================================================ */

const WA_NUMBER = '3813000379';
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

if(cartBtn) cartBtn.addEventListener('click', openCart);
if(cartClose) cartClose.addEventListener('click', closeCart);
if(cartOverlay) cartOverlay.addEventListener('click', closeCart);

// ── Renderizar items del carrito ─────────────────────────────
function renderCart() {
  // 1. Contador
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if(cartCount) cartCount.textContent = totalItems;

  // 2. Dinero Total
  const totalMoney = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  const totalPriceElement = document.getElementById('total-price');
  if (totalPriceElement) {
    totalPriceElement.textContent = totalMoney.toLocaleString('es-AR');
  }

  // 3. Dibujar productos
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Todavía no agregaste productos.</p>';
    if(cartSend) { cartSend.style.opacity = '0.4'; cartSend.style.pointerEvents = 'none'; }
    if(document.getElementById('checkout-btn')) document.getElementById('checkout-btn').style.display = 'none';
    return;
  }

  if(cartSend) { cartSend.style.opacity = '1'; cartSend.style.pointerEvents = 'all'; }
  if(document.getElementById('checkout-btn')) document.getElementById('checkout-btn').style.display = 'block';

  cart.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${Number(item.price * item.qty).toLocaleString('es-AR')}</div>
      </div>
      <div class="cart-item-controls">
        <button onclick="cambiarCantidad(${index}, -1)">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button onclick="cambiarCantidad(${index}, 1)">+</button>
      </div>
    `;
    cartItems.appendChild(el);
  });

  buildWhatsAppLink();
}

// Función auxiliar para botones + y -
window.cambiarCantidad = function(index, valor) {
  cart[index].qty += valor;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
};

// ── Agregar producto ────────────────────────────────────────
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    const price = parseFloat(btn.dataset.price) || 0;

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    btn.textContent = '✓ Agregado';
    setTimeout(() => { btn.textContent = '+ Agregar al pedido'; }, 1000);

    renderCart();
    openCart();
  });
});

// ── WhatsApp ────────────────────────────────────────────────
function buildWhatsAppLink() {
  if (cart.length === 0) return;
  let mensaje = '¡Hola! Me gustaría consultar por:\n\n';
  cart.forEach(item => { mensaje += `• ${item.name} x${item.qty}\n`; });
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  if(cartSend) cartSend.href = url;
}

// ── Mercado Pago ────────────────────────────────────────────
async function irAPagar() {
    if (cart.length === 0) return alert("El carrito está vacío");
    const btnPago = document.getElementById('checkout-btn');
    btnPago.innerText = "Cargando pago...";
    
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });
        const data = await response.json();
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert("Error en la respuesta del servidor");
            btnPago.innerText = "Pagar con Mercado Pago";
        }
    } catch (err) {
        alert("Error de conexión");
        btnPago.innerText = "Pagar con Mercado Pago";
    }
}

// ── Vaciar Carrito ──────────────────────────────────────────
if(cartClear) cartClear.addEventListener('click', () => { cart = []; renderCart(); });

// ── Inicializar ─────────────────────────────────────────────
renderCart();