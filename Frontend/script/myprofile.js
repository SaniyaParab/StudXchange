// ── AUTH ──────────────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem("user"));
if (!user) { alert("Please login first"); window.location.href = "Login.html"; }

const SERVER = "http://localhost:5000";
const $      = id => document.getElementById(id);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name) {
  return (name || '').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

// ── Profile Data ──────────────────────────────────────────────────────────────
const ext = JSON.parse(localStorage.getItem('studxchange_profile') || '{}');
const P = {
  name:    ext.name    || user.name  || '',
  email:   ext.email   || user.email || '',
  phone:   ext.phone   || '',
  college: ext.college || '',
  course:  ext.course  || '',
  loc:     ext.loc     || '',
  bio:     ext.bio     || '',
};

// ── Render Profile ────────────────────────────────────────────────────────────
function renderProfile() {
  $('avL').textContent      = getInitials(P.name);
  $('dispName').textContent = P.name    || 'Your Name';
  $('pCollege').textContent = P.college || 'Student';
  $('pLoc').textContent     = P.loc     || '—';
  $('abN').textContent  = P.name    || '—';
  $('abE').textContent  = P.email   || '—';
  $('abPh').textContent = P.phone   || '—';
  $('abC').textContent  = P.college || '—';
  $('abCo').textContent = P.course  || '—';
  $('abL').textContent  = P.loc     || '—';
  $('abB').textContent  = P.bio     || '—';
}

// ── Profile Edit Modal ────────────────────────────────────────────────────────
function openEdit() {
  $('fName').value    = P.name;
  $('fEmail').value   = P.email;
  $('fPhone').value   = P.phone;
  $('fCollege').value = P.college;
  $('fCourse').value  = P.course;
  $('fLoc').value     = P.loc;
  $('fBio').value     = P.bio;
  $('editModal').classList.add('on');
}
function closeEdit() { $('editModal').classList.remove('on'); }

function saveProfile() {
  P.name    = $('fName').value.trim()    || P.name;
  P.email   = $('fEmail').value.trim()   || P.email;
  P.phone   = $('fPhone').value.trim();
  P.college = $('fCollege').value.trim();
  P.course  = $('fCourse').value.trim();
  P.loc     = $('fLoc').value.trim();
  P.bio     = $('fBio').value.trim();
  localStorage.setItem('studxchange_profile', JSON.stringify(P));
  closeEdit();
  renderProfile();
  toast('Profile saved ✓');
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
function signOut() {
  localStorage.removeItem('user');
  localStorage.removeItem('studxchange_profile');
  window.location.href = 'Login.html';
}

function doShare() {
  if (navigator.share) navigator.share({ title: P.name + "'s Profile", url: location.href });
  else { navigator.clipboard.writeText(location.href); toast('Link copied 🔗'); }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function goTab(id, el) {
  document.querySelectorAll('.tb-btn').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  $('pane-' + id).classList.add('on');
  if (id === 'listings')  loadMyListings();
  if (id === 'requests')  loadRequests();
  if (id === 'wishlist')  loadWishlist();
}

// ══════════════════════════════════════════════════════════════════════════════
//  MY LISTINGS
// ══════════════════════════════════════════════════════════════════════════════
async function loadMyListings() {
  try {
    const res  = await fetch(`${SERVER}/my-listings/${user.id}`);
    const data = await res.json();
    const container = $('r-listings');

    if (!data.length) {
      container.innerHTML = `
        <div class="empty">
          <div class="ei">📦</div>
          <h4>No listings yet</h4>
          <p>List your first item!</p>
          <a href="sell.html">Sell an Item</a>
        </div>`;
      return;
    }

    container.innerHTML = data.map(item => {
      const isProduct  = item.item_type === 'product';
      const priceLabel = isProduct
        ? `₹${Number(item.price || 0).toLocaleString('en-IN')}`
        : `₹${item.rent_per_day}/day`;
      const badge = isProduct ? '🛍️ Sale' : '🔄 Rent';

      return `
        <div style="display:flex;gap:12px;align-items:flex-start;padding:14px;
                    border:1px solid #e2d3c3;border-radius:12px;margin-bottom:10px;background:#fff;">
          <img src="${item.image || 'https://via.placeholder.com/80'}"
               style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;"
               onerror="this.src='https://via.placeholder.com/80'">
          <div style="flex:1;min-width:0;">
            <div style="font-size:11px;color:#9C7B66;margin-bottom:2px;">${badge}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</div>
            <div style="color:#7B4B2A;font-weight:600;margin-bottom:4px;">${priceLabel}</div>
            <div style="font-size:12px;color:#9C7B66;">${item.category || '—'}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
            <button onclick='openEditItem(${JSON.stringify(item).replace(/'/g,"&#39;")})'
                    style="padding:6px 12px;border:1px solid #e2d3c3;background:#f7f3ee;
                           border-radius:8px;cursor:pointer;font-size:12px;">✏️ Edit</button>
            <button onclick="deleteItem(${item.id},'${item.item_type}')"
                    style="padding:6px 12px;border:1px solid #fca5a5;background:#fef2f2;
                           color:#dc2626;border-radius:8px;cursor:pointer;font-size:12px;">🗑 Delete</button>
          </div>
        </div>`;
    }).join('');
  } catch (err) { console.error("Error loading listings:", err); }
}

async function deleteItem(id, type) {
  if (!confirm("Delete this listing?")) return;
  const url = type === 'rent'
    ? `${SERVER}/delete-rent/${id}/${user.id}`
    : `${SERVER}/delete-product/${id}/${user.id}`;
  try {
    const res  = await fetch(url, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast("Deleted ✓"); loadMyListings(); }
    else toast("Delete failed");
  } catch { toast("Delete failed"); }
}

// ── Edit Listing Modal ────────────────────────────────────────────────────────
let currentEditingItem = null;

function openEditItem(item) {
  currentEditingItem = item;
  $("editItemTitle").value       = item.title       || "";
  $("editItemCategory").value    = item.category    || "";
  $("editItemDescription").value = item.description || "";
  $("editItemContact").value     = item.contact     || "";
  $("editItemImage").value       = item.image       || "";

  if (item.item_type === "product") {
    $("editItemPriceWrap").style.display     = "block";
    $("editItemConditionWrap").style.display = "block";
    $("editItemRentWrap").style.display      = "none";
    $("editItemDepositWrap").style.display   = "none";
    $("editItemPrice").value     = item.price          || "";
    $("editItemCondition").value = item.condition_type || "";
  } else {
    $("editItemPriceWrap").style.display     = "none";
    $("editItemConditionWrap").style.display = "none";
    $("editItemRentWrap").style.display      = "block";
    $("editItemDepositWrap").style.display   = "block";
    $("editItemRent").value    = item.rent_per_day || "";
    $("editItemDeposit").value = item.deposit      || "";
  }
  $("editListingModal").classList.add("on");
}

function closeEditListing() {
  $("editListingModal").classList.remove("on");
  currentEditingItem = null;
}

async function saveEditedItem() {
  if (!currentEditingItem) return;
  const payload = {
    title:       $("editItemTitle").value.trim(),
    category:    $("editItemCategory").value.trim(),
    description: $("editItemDescription").value.trim(),
    contact:     $("editItemContact").value.trim(),
    image:       $("editItemImage").value.trim(),
    seller_id:   user.id
  };
  let url = "";
  if (currentEditingItem.item_type === "product") {
    url = `${SERVER}/update-product/${currentEditingItem.id}`;
    payload.price          = $("editItemPrice").value.trim();
    payload.condition_type = $("editItemCondition").value.trim();
  } else {
    url = `${SERVER}/update-rent/${currentEditingItem.id}`;
    payload.rent_per_day = $("editItemRent").value.trim();
    payload.deposit      = $("editItemDeposit").value.trim();
  }
  try {
    const res  = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) { toast("Updated ✓"); closeEditListing(); loadMyListings(); }
    else toast("Update failed");
  } catch { toast("Update failed"); }
}

// ══════════════════════════════════════════════════════════════════════════════
//  REQUESTS TAB — shows both buy chat requests AND rent requests
// ══════════════════════════════════════════════════════════════════════════════
async function loadRequests() {
  const container = $('requestContainer');
  container.innerHTML = `<div style="padding:20px;text-align:center;color:#9C7B66;">Loading…</div>`;

  try {
    // Fetch both in parallel
    const [chatRes, rentRes] = await Promise.all([
      fetch(`${SERVER}/get-requests/${user.id}`),
      fetch(`${SERVER}/my-rent-requests/${user.id}`)
    ]);

    const chatRequests = await chatRes.json();
    const rentRequests = await rentRes.json();

    // Separate buy vs rent from chat_requests
    // (rent ones are also in rentRequests — we render them from rentRequests for richer data)
    const buyRequests = chatRequests.filter(r =>
      (r.request_type || 'buy') === 'buy'
    );

    if (!buyRequests.length && !rentRequests.length) {
      container.innerHTML = `
        <div class="empty">
          <div class="ei">💬</div>
          <h4>No requests yet</h4>
          <p>When buyers or renters contact you, their requests will appear here.</p>
        </div>`;
      return;
    }

    let html = '';

    // ── RENT REQUESTS ────────────────────────────────────────────────────────
    if (rentRequests.length) {
      html += `<div style="font-size:12px;font-weight:700;color:#9C7B66;letter-spacing:.05em;
                            text-transform:uppercase;margin:0 0 10px;">🔄 Rent Requests</div>`;

      html += rentRequests.map(r => {
        const statusColor = r.status === 'accepted' ? '#276840' :
                            r.status === 'rejected' ? '#dc2626' : '#b45309';
        const statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1);

        return `
          <div style="padding:16px;border:1px solid #d4e8d4;border-radius:12px;
                      margin-bottom:12px;background:#f6fbf6;">

            <!-- Item info -->
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
              <img src="${r.item_image || 'https://via.placeholder.com/56'}"
                   style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;"
                   onerror="this.src='https://via.placeholder.com/56'">
              <div>
                <div style="font-size:12px;color:#276840;font-weight:600;margin-bottom:2px;">🔄 Rent Request</div>
                <div style="font-weight:700;font-size:14px;">${r.item_title}</div>
                <div style="font-size:12px;color:#6B4838;margin-top:2px;">
                  👤 From: <b>${r.renter_name}</b> &nbsp;·&nbsp; 📧 ${r.renter_email}
                </div>
              </div>
            </div>

            <!-- Rental details -->
            <div style="background:#fff;border-radius:8px;padding:10px 12px;margin-bottom:10px;
                        border:1px solid #C0DEC8;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div><div style="font-size:11px;color:#9C7B66;">Start Date</div>
                   <div style="font-weight:600;font-size:13px;">${fmtDate(r.start_date)}</div></div>
              <div><div style="font-size:11px;color:#9C7B66;">End Date</div>
                   <div style="font-weight:600;font-size:13px;">${fmtDate(r.end_date)}</div></div>
              <div><div style="font-size:11px;color:#9C7B66;">Total Cost</div>
                   <div style="font-weight:700;font-size:14px;color:#276840;">₹${r.total_cost}</div></div>
              <div><div style="font-size:11px;color:#9C7B66;">Rate</div>
                   <div style="font-weight:600;font-size:13px;">₹${r.rent_per_day}/day</div></div>
            </div>

            ${r.message ? `
              <div style="background:#fffbf0;border:1px solid #fde68a;border-radius:8px;
                          padding:8px 12px;margin-bottom:10px;font-size:13px;">
                💬 "${r.message}"
              </div>` : ''}

            <!-- Status -->
            <div style="font-size:12px;margin-bottom:10px;">
              Status: <span style="font-weight:700;color:${statusColor};">${statusLabel}</span>
            </div>

            <!-- Actions -->
            ${r.status === 'pending' ? `
              <div style="display:flex;gap:8px;">
                <button onclick="acceptRentRequest(${r.id})"
                        style="flex:1;padding:9px;background:#276840;color:#fff;border:none;
                               border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
                  ✅ Accept & Open Chat
                </button>
                <button onclick="rejectRentRequest(${r.id})"
                        style="flex:1;padding:9px;background:#fef2f2;color:#dc2626;
                               border:1px solid #fca5a5;border-radius:8px;cursor:pointer;
                               font-size:13px;font-weight:600;">
                  ✕ Reject
                </button>
              </div>` : ''}

            ${r.status === 'accepted' && r.chat_request_id ? `
              <button onclick="openChat(${r.chat_request_id})"
                      style="width:100%;padding:9px;background:#7B4B2A;color:#fff;border:none;
                             border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
                💬 Open Chat with Renter
              </button>` : ''}

            ${r.status === 'rejected' ? `
              <div style="padding:9px;background:#fef2f2;border-radius:8px;text-align:center;
                          font-size:13px;color:#dc2626;font-weight:600;">
                ❌ Request Rejected
              </div>` : ''}
          </div>`;
      }).join('');
    }

    // ── BUY CHAT REQUESTS ────────────────────────────────────────────────────
    if (buyRequests.length) {
      html += `<div style="font-size:12px;font-weight:700;color:#9C7B66;letter-spacing:.05em;
                            text-transform:uppercase;margin:${rentRequests.length ? '20px' : '0'} 0 10px;">
                 🛍️ Buy Requests</div>`;

      html += buyRequests.map(r => {
        const statusColor = r.status === 'accepted' ? '#276840' :
                            r.status === 'rejected' ? '#dc2626' : '#b45309';
        const statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1);

        return `
          <div style="padding:14px;border:1px solid #e2d3c3;border-radius:12px;
                      margin-bottom:10px;background:#fff;">
            ${r.product_image ? `
              <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
                <img src="${r.product_image}"
                     style="width:48px;height:48px;object-fit:cover;border-radius:8px;"
                     onerror="this.style.display='none'">
                <div>
                  <div style="font-weight:700;font-size:14px;">${r.product_title}</div>
                  <div style="font-size:12px;color:#6B4838;">👤 <b>${r.buyer_name}</b></div>
                </div>
              </div>` : `
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">📦 ${r.product_title}</div>
              <div style="font-size:13px;color:#6B4838;margin-bottom:8px;">👤 Buyer: <b>${r.buyer_name}</b></div>`}

            <div style="font-size:12px;margin-bottom:10px;">
              Status: <span style="font-weight:600;color:${statusColor};">${statusLabel}</span>
            </div>

            ${r.status === 'pending' ? `
              <div style="display:flex;gap:8px;">
                <button onclick="acceptRequest(${r.id})"
                        style="flex:1;padding:8px;background:#276840;color:#fff;border:none;
                               border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
                  ✅ Accept
                </button>
                <button onclick="rejectRequest(${r.id})"
                        style="flex:1;padding:8px;background:#fef2f2;color:#dc2626;
                               border:1px solid #fca5a5;border-radius:8px;cursor:pointer;
                               font-size:13px;font-weight:600;">
                  ✕ Reject
                </button>
              </div>` : ''}

            ${r.status === 'accepted' ? `
              <button onclick="openChat(${r.id})"
                      style="width:100%;padding:8px;background:#7B4B2A;color:#fff;border:none;
                             border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
                💬 Open Chat
              </button>` : ''}
          </div>`;
      }).join('');
    }

    container.innerHTML = html;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="padding:20px;color:#9C7B66;">Failed to load requests.</p>`;
  }
}

// Accept rent request → updates both rent_requests + chat_requests → enables chat
async function acceptRentRequest(rentRequestId) {
  try {
    const res  = await fetch(`${SERVER}/accept-rent-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rent_request_id: rentRequestId })
    });
    const data = await res.json();
    if (data.success) {
      toast("Rent request accepted! ✅ Chat is now open.");
      loadRequests();
      // Auto-open chat if we have the chat_request_id
      if (data.chat_request_id) {
        setTimeout(() => openChat(data.chat_request_id), 1000);
      }
    } else {
      toast(data.error || "Could not accept request");
    }
  } catch { toast("Server error"); }
}

async function rejectRentRequest(rentRequestId) {
  if (!confirm("Reject this rent request?")) return;
  try {
    const res  = await fetch(`${SERVER}/reject-rent-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rent_request_id: rentRequestId })
    });
    const data = await res.json();
    if (data.success) { toast("Rent request rejected"); loadRequests(); }
    else toast(data.error || "Could not reject request");
  } catch { toast("Server error"); }
}

// Accept buy chat request
function acceptRequest(id) {
  fetch(`${SERVER}/accept-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request_id: id })
  }).then(() => { toast("Request accepted ✅"); loadRequests(); });
}

function rejectRequest(id) {
  fetch(`${SERVER}/reject-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request_id: id })
  }).then(() => { toast("Request rejected"); loadRequests(); });
}

function openChat(request_id) {
  window.location.href = `chat.html?request_id=${request_id}`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  WISHLIST
// ══════════════════════════════════════════════════════════════════════════════
async function loadWishlist() {
  try {
    const res   = await fetch(`${SERVER}/wishlist/${user.id}`);
    const items = await res.json();
    const container = $("r-wishlist");

    if (!items.length) {
      container.innerHTML = `
        <div class="empty">
          <div class="ei">♡</div>
          <h4>Nothing saved</h4>
          <p>Tap ♡ on any item to save it here.</p>
          <a href="marketplace.html">Browse Marketplace</a>
        </div>`;
      return;
    }

    container.innerHTML = items.map(item => {
      const priceLabel = item.item_type === 'product'
        ? `₹${Number(item.price || 0).toLocaleString('en-IN')}`
        : `₹${item.rent_per_day}/day • Deposit ₹${item.deposit || 0}`;
      const badge = item.item_type === 'product' ? '🛍️ Sale' : '🔄 Rent';

      return `
        <div style="display:flex;gap:12px;align-items:flex-start;padding:14px;
                    border:1px solid #e2d3c3;border-radius:12px;margin-bottom:10px;background:#fff;">
          <img src="${item.image || 'https://via.placeholder.com/80'}"
               style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;"
               onerror="this.src='https://via.placeholder.com/80'">
          <div style="flex:1;min-width:0;">
            <div style="font-size:11px;color:#9C7B66;margin-bottom:2px;">${badge}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${item.title}</div>
            <div style="color:#7B4B2A;font-weight:600;margin-bottom:4px;">${priceLabel}</div>
            <div style="font-size:12px;color:#9C7B66;">${item.category || '—'}</div>
          </div>
          <button onclick="removeWishlist(${item.item_id},'${item.item_type}')"
                  style="padding:6px 12px;border:1px solid #fca5a5;background:#fef2f2;color:#dc2626;
                         border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0;">
            ✕ Remove
          </button>
        </div>`;
    }).join('');
  } catch (err) {
    console.error(err);
    $("r-wishlist").innerHTML = "<p style='padding:20px;color:#9C7B66;'>Failed to load wishlist.</p>";
  }
}

async function removeWishlist(itemId, itemType) {
  try {
    const res  = await fetch(`${SERVER}/wishlist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, item_id: itemId, item_type: itemType })
    });
    const data = await res.json();
    if (data.success) { toast("Removed from wishlist"); loadWishlist(); }
    else toast("Could not remove item");
  } catch { toast("Remove failed"); }
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderProfile();
loadMyListings();