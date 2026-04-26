// const SERVER = "http://localhost:5000";
// const user   = JSON.parse(localStorage.getItem("user"));
// let allItems    = [];
// let activeFilter = "all";

// // ── Toast ─────────────────────────────────────────────────────────────────────
// function toast(msg) {
//   const t = document.getElementById("toast");
//   t.textContent = msg;
//   t.classList.add("show");
//   setTimeout(() => t.classList.remove("show"), 2800);
// }

// // ── Post Rental Button ────────────────────────────────────────────────────────
// function goPostRent() {
//   if (!user) { toast("Please sign in to list a rental"); setTimeout(() => location.href = "Login.html", 1500); return; }
//   location.href = "rent.html";
// }

// // ── Filter ────────────────────────────────────────────────────────────────────
// function setFilter(cat, el) {
//   activeFilter = cat;
//   document.querySelectorAll(".fchip").forEach(c => c.classList.remove("on"));
//   el.classList.add("on");
//   filterItems();
// }

// function filterItems() {
//   const q = (document.getElementById("searchInput").value || "").toLowerCase();
//   let list = allItems;
//   if (activeFilter !== "all") list = list.filter(i => i.category === activeFilter);
//   if (q) list = list.filter(i =>
//     i.title.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
//   renderGrid(list);
// }

// // ── Load from server ──────────────────────────────────────────────────────────
// async function loadRentals() {
//   const grid = document.getElementById("rentGrid");
//   grid.innerHTML = `
//     <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--tx3);">
//       <div style="font-size:32px;margin-bottom:10px;animation:float 2s infinite ease-in-out">🔄</div>
//       <p>Loading rentals…</p>
//     </div>`;

//   try {
//     const res = await fetch(`${SERVER}/rent-products`);
//     allItems  = await res.json();
//     const sc  = document.getElementById("statCount");
//     if (sc) sc.textContent = allItems.length;
//     renderGrid(allItems);
//   } catch {
//     grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
//       <div class="ei">⚠️</div>
//       <h4>Could not connect</h4>
//       <p>Make sure your server is running with <b>node server.js</b></p>
//     </div>`;
//   }
// }

// // ── Render Grid ───────────────────────────────────────────────────────────────
// function renderGrid(list) {
//   const grid = document.getElementById("rentGrid");
//   if (!list.length) {
//     grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
//       <div class="ei">🔄</div>
//       <h4>No rentals yet</h4>
//       <p>Be the first to list something for rent!</p>
//     </div>`;
//     return;
//   }

//   grid.innerHTML = list.map((item, i) => `
//     <div class="rent-card" style="animation-delay:${i * 0.05}s" onclick="openDetail(${item.id})">
//       <div class="rent-img">
//         ${item.image
//           ? `<img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'">`
//           : "🔄"}
//         <span class="rent-badge">RENT</span>
//         <span class="rent-avail ${item.is_available ? 'avail-yes' : 'avail-no'}">
//           ${item.is_available ? '✅ Available' : '❌ Rented'}
//         </span>
//       </div>
//       <div class="rent-body">
//         <div class="rent-title">${item.title}</div>
//         <div class="rent-price-row">
//           ${item.rent_per_day ? `<span class="rent-price rent-price-day">₹${item.rent_per_day}/day</span>` : ""}
//         </div>
//         <div class="rent-meta">🏷 ${item.category} • 💰 Deposit: ₹${item.deposit || 0}<br>👤 ${item.seller_name}</div>
//         <div class="rent-footer" onclick="event.stopPropagation()">
//           <button class="btn-rent" onclick="openDetail(${item.id})">View & Rent</button>
//           <button class="btn-wish" onclick="addWishlist(event,${item.id})">♡</button>
//         </div>
//       </div>
//     </div>`).join("");
// }

// // ── Open Detail Modal ─────────────────────────────────────────────────────────
// async function openDetail(id) {
//   const modal = document.getElementById("rentModal");
//   modal.classList.add("on");
//   document.body.style.overflow = "hidden";

//   const item = allItems.find(i => i.id === id);
//   if (!item) return;

//   const isOwn = user && user.id === item.seller_id;

//   // Check if logged-in renter already has a request for this item
//   let existingRequest = null;
//   if (user && !isOwn) {
//     try {
//       const statusRes = await fetch(`${SERVER}/rent-request-status/${user.id}/${item.id}`);
//       const statusData = await statusRes.json();
//       if (statusData.status !== "none") existingRequest = statusData;
//     } catch { /* ignore */ }
//   }

//   document.getElementById("rentModalContent").innerHTML = `
//     <div class="modal-img">
//       ${item.image ? `<img src="${item.image}" alt="${item.title}" onerror="this.style.display='none'">` : "🔄"}
//     </div>
//     <div class="modal-content">
//       <div class="modal-title">${item.title}</div>
//       <div class="modal-seller">👤 Listed by <b>${item.seller_name}</b> &nbsp;•&nbsp; 🏷 ${item.category}</div>

//       <div class="price-boxes">
//         ${item.rent_per_day ? `<div class="price-box teal">
//           <div class="price-box-lbl">Per Day</div>
//           <div class="price-box-val">₹${item.rent_per_day}</div>
//           <div class="price-box-sub">Daily rate</div>
//         </div>` : ""}
//         ${item.deposit ? `<div class="price-box">
//           <div class="price-box-lbl">Security Deposit</div>
//           <div class="price-box-val" style="color:var(--br)">₹${item.deposit}</div>
//           <div class="price-box-sub">Refundable</div>
//         </div>` : ""}
//       </div>

//       <div class="modal-section">
//         <h4>Description</h4>
//         <p>${item.description || "No description provided."}</p>
//       </div>

//       <div class="modal-section">
//         <h4>Item Details</h4>
//         <div class="modal-info-grid">
//           <div class="info-item">
//             <div class="info-item-lbl">Availability</div>
//             <div class="info-item-val">${item.is_available ? "✅ Available" : "❌ Rented Out"}</div>
//           </div>
//           <div class="info-item">
//             <div class="info-item-lbl">Category</div>
//             <div class="info-item-val">🏷 ${item.category}</div>
//           </div>
//           <div class="info-item">
//             <div class="info-item-lbl">Contact</div>
//             <div class="info-item-val">📞 ${item.contact || "—"}</div>
//           </div>
//           <div class="info-item">
//             <div class="info-item-lbl">Listed By</div>
//             <div class="info-item-val">👤 ${item.seller_name}</div>
//           </div>
//         </div>
//       </div>

//       ${renderRequestSection(item, isOwn, existingRequest)}
//     </div>`;
// }

// // ── Render request section based on state ────────────────────────────────────
// function renderRequestSection(item, isOwn, existingRequest) {
//   if (isOwn) {
//     return `<p style="text-align:center;color:var(--tx3);font-size:13px;padding:16px;
//                        background:var(--bg);border-radius:12px;">This is your listing.</p>`;
//   }

//   if (!user) {
//     return `<div style="text-align:center;padding:16px;">
//       <p style="margin-bottom:12px;color:var(--tx3);">Sign in to request this item</p>
//       <button class="btn-rent" style="width:100%" onclick="location.href='Login.html'">Sign In to Rent</button>
//     </div>`;
//   }

//   if (!item.is_available) {
//     return `<p style="text-align:center;padding:16px;background:#fee2e2;border-radius:12px;
//                        color:#991b1b;font-size:13px;font-weight:600">❌ This item is currently rented out</p>`;
//   }

//   // Already requested — show status instead of form
//   if (existingRequest) {
//     const { status, request } = existingRequest;

//     if (status === 'pending') {
//       return `<div style="padding:16px;background:#fffbf0;border:1px solid #fde68a;border-radius:12px;text-align:center;">
//         <div style="font-size:24px;margin-bottom:8px;">⏳</div>
//         <div style="font-weight:700;font-size:15px;margin-bottom:4px;">Request Sent!</div>
//         <div style="font-size:13px;color:#92400e;">Waiting for the owner to accept your rent request.</div>
//         <div style="font-size:12px;color:#9C7B66;margin-top:8px;">
//           ${fmtDate(request.start_date)} → ${fmtDate(request.end_date)} &nbsp;·&nbsp; ₹${request.total_cost} total
//         </div>
//       </div>`;
//     }

//     if (status === 'accepted') {
//       return `<div style="padding:16px;background:#f0fdf4;border:1px solid #C0DEC8;border-radius:12px;text-align:center;">
//         <div style="font-size:24px;margin-bottom:8px;">✅</div>
//         <div style="font-weight:700;font-size:15px;margin-bottom:4px;color:#276840;">Request Accepted!</div>
//         <div style="font-size:13px;color:#276840;margin-bottom:12px;">You can now chat with the owner.</div>
//         ${request.chat_request_id
//           ? `<button class="btn-rent" style="width:100%" onclick="location.href='chat.html?request_id=${request.chat_request_id}'">
//                💬 Open Chat with Owner
//              </button>`
//           : `<a href="myprofile.html" class="btn-rent" style="display:block;text-align:center;text-decoration:none;padding:10px;">
//                💬 Go to My Profile → Requests
//              </a>`}
//       </div>`;
//     }

//     if (status === 'rejected') {
//       return `<div style="padding:16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;text-align:center;">
//         <div style="font-size:24px;margin-bottom:8px;">❌</div>
//         <div style="font-weight:700;font-size:15px;margin-bottom:4px;color:#dc2626;">Request Rejected</div>
//         <div style="font-size:13px;color:#9C7B66;">The owner could not accommodate your request.</div>
//       </div>`;
//     }
//   }

//   // No existing request — show the form
//   return `<div class="rent-form">
//     <h4>🗓️ Request to Rent</h4>
//     <div class="fg-row">
//       <div class="fg">
//         <label>Start Date</label>
//         <input type="date" id="rd-start" onchange="calcCost(${item.rent_per_day || 0})"
//           min="${new Date().toISOString().split('T')[0]}">
//       </div>
//       <div class="fg">
//         <label>End Date</label>
//         <input type="date" id="rd-end" onchange="calcCost(${item.rent_per_day || 0})"
//           min="${new Date().toISOString().split('T')[0]}">
//       </div>
//     </div>
//     <div class="cost-preview" id="costPreview" style="display:none">
//       <span class="cost-preview-lbl">Estimated Cost</span>
//       <span class="cost-preview-val" id="costVal">₹0</span>
//     </div>
//     <div class="fg">
//       <label>Message to Owner <span style="font-weight:400;color:#9C7B66;">(optional)</span></label>
//       <textarea id="rd-msg" rows="2" placeholder="e.g. I need this for a college project…"></textarea>
//     </div>
//     <button class="btn-rent" style="width:100%;margin-top:4px"
//       onclick="sendRentRequest(${item.id}, ${item.seller_id}, ${item.rent_per_day || 0})">
//       🔄 Send Rent Request
//     </button>
//     <p style="font-size:12px;color:#9C7B66;text-align:center;margin-top:8px;">
//       The owner will receive a notification and can accept/reject from their profile.
//     </p>
//   </div>`;
// }

// function fmtDate(d) {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
// }

// // ── Calc Cost ─────────────────────────────────────────────────────────────────
// function calcCost(perDay) {
//   const s = document.getElementById("rd-start")?.value;
//   const e = document.getElementById("rd-end")?.value;
//   const preview = document.getElementById("costPreview");
//   if (!preview) return;
//   if (!s || !e) { preview.style.display = "none"; return; }
//   const days = Math.max(1, Math.ceil((new Date(e) - new Date(s)) / 86400000));
//   document.getElementById("costVal").textContent = `₹${days * perDay} (${days} day${days > 1 ? 's' : ''})`;
//   preview.style.display = "flex";
// }

// // ── Send Rent Request ─────────────────────────────────────────────────────────
// async function sendRentRequest(productId, ownerId, perDay) {
//   if (!user) { toast("Please sign in first"); setTimeout(() => location.href = "Login.html", 1500); return; }

//   const start = document.getElementById("rd-start")?.value;
//   const end   = document.getElementById("rd-end")?.value;
//   const msg   = document.getElementById("rd-msg")?.value.trim();

//   if (!start || !end) { toast("Please select start and end dates"); return; }
//   if (new Date(end) <= new Date(start)) { toast("End date must be after start date"); return; }

//   const days  = Math.ceil((new Date(end) - new Date(start)) / 86400000);
//   const total = days * perDay;

//   // Disable button while sending
//   const btn = document.querySelector('.rent-form .btn-rent');
//   if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

//   try {
//     const res  = await fetch(`${SERVER}/send-rent-request`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         renter_id:  user.id,
//         owner_id:   ownerId,
//         product_id: productId,
//         start_date: start,
//         end_date:   end,
//         total_cost: total,
//         message:    msg || ""
//       })
//     });
//     const data = await res.json();

//     if (data.success) {
//       toast("Rent request sent! ✅ The owner will be notified.");
//       // Re-open detail to show status
//       setTimeout(() => openDetail(productId), 800);
//     } else {
//       toast(data.error || "Could not send request");
//       if (btn) { btn.disabled = false; btn.textContent = "🔄 Send Rent Request"; }
//     }
//   } catch {
//     toast("Server error — please try again");
//     if (btn) { btn.disabled = false; btn.textContent = "🔄 Send Rent Request"; }
//   }
// }

// // ── Wishlist ──────────────────────────────────────────────────────────────────
// function addWishlist(e, rentId) {
//   e.stopPropagation();
//   if (!user) {
//     toast("Sign in to save wishlist ❤️");
//     setTimeout(() => location.href = "Login.html", 1500);
//     return;
//   }
//   fetch(`${SERVER}/wishlist`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user_id: user.id, item_id: rentId, item_type: "rent" })
//   })
//     .then(r => r.json())
//     .then(d => toast(d.inserted ? "Saved to wishlist ❤️" : "Already in wishlist"))
//     .catch(() => toast("Could not save to wishlist"));
// }

// // ── Close Modal ───────────────────────────────────────────────────────────────
// function closeModal() {
//   document.getElementById("rentModal").classList.remove("on");
//   document.body.style.overflow = "";
// }

// // ── Init ──────────────────────────────────────────────────────────────────────
// loadRentals();