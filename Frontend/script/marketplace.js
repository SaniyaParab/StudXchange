let allProducts = [];
let currentCategory = 'all';

// ── Navbar scroll effect ──────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
});

// ── User UI ───────────────────────────────────────────────────────────────────
function loadUserUI() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name) {
    const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('profileLabel').textContent  = user.name.split(" ")[0];
    document.getElementById('dropdownName').textContent  = user.name;
    document.getElementById('dropdownEmail').textContent = user.email;
    document.getElementById('dropdownSignedOut').style.display = 'none';
    document.getElementById('dropdownSignedIn').style.display  = 'block';
  } else {
    document.getElementById('profileAvatar').textContent = "?";
    document.getElementById('profileLabel').textContent  = "Account";
    document.getElementById('dropdownSignedOut').style.display = 'block';
    document.getElementById('dropdownSignedIn').style.display  = 'none';
  }
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
function toggleProfileDropdown() {
  document.getElementById('profileDropdown').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const btn = document.getElementById('profileBtn');
  const dd  = document.getElementById('profileDropdown');
  if (btn && dd && !btn.contains(e.target) && !dd.contains(e.target))
    dd.classList.remove('open');
});

// ── Auth ──────────────────────────────────────────────────────────────────────
function goToSignIn()  { localStorage.setItem('redirect_after_login', window.location.href); location.href = 'Login.html'; }
function goToSignUp()  { location.href = 'Login.html'; }
function signOut() {
  localStorage.removeItem("user");
  showToast("Signed out successfully 👋");
  setTimeout(() => location.reload(), 1200);
}
function handleSell() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) { showToast("Sign in to sell"); setTimeout(() => location.href = 'Login.html', 1500); }
  else location.href = 'sell.html';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Navigation ────────────────────────────────────────────────────────────────
function goToProduct(id) { location.href = `buy.html?id=${id}`; }

// ── Wishlist ──────────────────────────────────────────────────────────────────
function addToWishlist(e, productId) {
  e.stopPropagation();
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    showToast("Sign in to save wishlist ❤️");
    setTimeout(() => location.href = 'Login.html', 1500);
    return;
  }

  fetch("http://localhost:5000/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, item_id: productId, item_type: "product" })
  })
    .then(r => r.json())
    .then(d => showToast(d.inserted ? "Added to wishlist ❤️" : "Already in wishlist"))
    .catch(() => showToast("Could not save to wishlist"));
}

// ── Filter / Sort / Search ────────────────────────────────────────────────────
function filterByCategory(cat, el) {
  currentCategory = cat;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  applyFilters();
}

function searchProducts() { applyFilters(); }
function sortProducts()   { applyFilters(); }

function applyFilters() {
  const q    = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const sort = document.getElementById('sortSelect')?.value || 'newest';
  let list   = [...allProducts];

  if (currentCategory !== 'all') list = list.filter(p => p.category === currentCategory);
  if (q) list = list.filter(p =>
    p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));

  if (sort === 'price-low')  list.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
  if (sort === 'newest')     list.sort((a, b) => b.id - a.id);

  renderProducts(list);
}

// ── Render products ───────────────────────────────────────────────────────────
function renderProducts(list) {
  const container = document.getElementById("productContainer");
  const countEl   = document.getElementById("productCount");

  if (!list.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted);">
        <div style="font-size:48px;margin-bottom:12px;">🔍</div>
        <h3 style="margin-bottom:8px;">No products found</h3>
        <p>Try a different search or category</p>
      </div>`;
    if (countEl) countEl.textContent = "0 items";
    return;
  }

  if (countEl) countEl.textContent = `${list.length} item${list.length === 1 ? '' : 's'} found`;

  container.innerHTML = list.map((p, i) => `
    <div class="card" style="animation-delay:${i * 0.05}s" onclick="goToProduct(${p.id})">
      <div class="card-img">
        ${p.image
          ? `<img src="${p.image}" alt="${p.title}" loading="lazy"
               onerror="this.parentElement.innerHTML='<div class=no-img>📦</div>'">`
          : `<div class="no-img">📦</div>`}
        <span class="card-badge">${p.category}</span>
      </div>
      <div class="card-info">
        <div class="card-title">${p.title}</div>
        <div class="card-price">₹${Number(p.price).toLocaleString('en-IN')}</div>
        <div class="card-meta">
          <span>📦 ${p.condition_type || 'Used'}</span>
          <span>👤 ${p.seller_name}</span>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-buy" onclick="event.stopPropagation();goToProduct(${p.id})">Buy Now</button>
        <button class="btn-wishlist" onclick="addToWishlist(event,${p.id})" title="Add to wishlist">♡</button>
      </div>
    </div>`).join("");
}

// ── Load products ─────────────────────────────────────────────────────────────
async function loadProducts() {
  try {
    const res  = await fetch("http://localhost:5000/products");
    allProducts = await res.json();
    applyFilters();
  } catch {
    document.getElementById("productContainer").innerHTML =
      `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted);">
        <div style="font-size:40px">⚠️</div>
        <p style="margin-top:12px">Server not running. Start with <b>node server.js</b></p>
      </div>`;
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUserUI();
  loadProducts();
});
window.addEventListener('focus', loadUserUI);