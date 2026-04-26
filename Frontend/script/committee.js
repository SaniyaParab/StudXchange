// ═══════════════════════════════════════════════════════════════
//  committeehub.js  —  Committee Hub with Role Gate
//  Roles: 'user' (student) and 'admin'
//  Admin verified via PIN dialog (default: 1234)
// ═══════════════════════════════════════════════════════════════

const SERVER = "http://localhost:5000";

// ── AUTH ──────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Please login to access the Committee Hub.");
  location.href = "Login.html";
}

// ══════════════════════════════════════════════════════════════
//  ROLE GATE — must be chosen every page load (session-only)
// ══════════════════════════════════════════════════════════════
const ADMIN_PIN = "1234"; // Change this to your desired PIN

let currentRole = sessionStorage.getItem("hub_role") || null; // 'user' | 'admin'

// Fill name in gate
const rgName = document.getElementById("rgName");
if (rgName && user) rgName.textContent = user.name;

// If role already chosen this session, skip gate immediately
if (currentRole) {
  document.getElementById("roleGate").style.display = "none";
  document.getElementById("appShell").style.display  = "block";
} 

/** Called when user clicks Student button */
function selectRole(role) {
  currentRole = role;
  sessionStorage.setItem("hub_role", role);
  document.getElementById("roleGate").style.display = "none";
  document.getElementById("appShell").style.display  = "block";
  init();
}

/** Called when user clicks Admin button — shows PIN dialog */
function tryAdmin() {
  document.getElementById("adminPinDialog").classList.add("open");
  setTimeout(() => document.getElementById("pinInput").focus(), 100);
}

function closePinDialog() {
  document.getElementById("adminPinDialog").classList.remove("open");
  document.getElementById("pinInput").value = "";
  document.getElementById("pinError").textContent = "";
}

function clearPinError() {
  document.getElementById("pinError").textContent = "";
}

function confirmAdmin() {
  const entered = document.getElementById("pinInput").value.trim();
  if (entered === ADMIN_PIN) {
    closePinDialog();
    selectRole("admin");
  } else {
    document.getElementById("pinError").textContent = "Incorrect PIN. Please try again.";
    document.getElementById("pinInput").value = "";
    document.getElementById("pinInput").focus();
  }
}

/** Switch Role — wipes session role and reloads the gate */
function resetRole() {
  sessionStorage.removeItem("hub_role");
  currentRole = null;
  document.getElementById("appShell").style.display  = "none";
  document.getElementById("roleGate").style.display  = "flex";
}

// ── ROLE HELPERS ──────────────────────────────────────────────
/** Returns true when the current session role is admin */
function isAdmin() {
  return currentRole === "admin";
}

/** Returns true if the admin can manage a specific committee */
function isCommitteeAdmin(committeeId) {
  if (!isAdmin()) return false;
  // Global admin: always yes
  const ADMIN_EMAILS = ["admin@vcet.edu.in", "principal@vcet.edu.in"];
  if (ADMIN_EMAILS.includes(user.email)) return true;
  // Committee creator acting as admin
  const c = getData("committees").find(c => c.id === committeeId);
  return c && c.createdBy === user.email;
}

// ── DATA STORE (localStorage) ─────────────────────────────────
function getData(key, def = []) {
  try { return JSON.parse(localStorage.getItem("hub_" + key)) || def; }
  catch { return def; }
}
function setData(key, val) {
  localStorage.setItem("hub_" + key, JSON.stringify(val));
}
function genId() { return Date.now() + Math.random().toString(36).slice(2, 7); }

// ── SEED DEFAULT DATA ─────────────────────────────────────────
function seedDefaultData() {
  if (getData("seeded", false)) return;

  const committees = [
    { id: "c1", name: "Coding Club",        icon: "💻", category: "Technical",     description: "A community for passionate developers. We host hackathons, coding contests, and hands-on workshops on web, app, and AI development.", memberCount: 42, createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now() - 86400000*30).toISOString() },
    { id: "c2", name: "Cultural Committee", icon: "🎭", category: "Cultural",      description: "We celebrate the vibrant cultural diversity of our college through festivals, performances, dance, music, and drama events.", memberCount: 68, createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now() - 86400000*60).toISOString() },
    { id: "c3", name: "NSS",                icon: "🌿", category: "Social Service",description: "National Service Scheme — dedicated to community development, social awareness, and volunteer work around our campus and city.", memberCount: 55, createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now() - 86400000*90).toISOString() },
    { id: "c4", name: "Sports Club",        icon: "⚽", category: "Sports",        description: "For athletes and fitness enthusiasts. We organize inter-college tournaments, fitness challenges, and sports meets throughout the year.", memberCount: 80, createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now() - 86400000*45).toISOString() },
    { id: "c5", name: "Photography Club",   icon: "📷", category: "Arts",          description: "Explore the art of visual storytelling. Weekly photo walks, editing workshops, and an annual photo exhibition.", memberCount: 29, createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now() - 86400000*20).toISOString() },
    { id: "c6", name: "Entrepreneurship Cell", icon: "🚀", category: "Technical",  description: "E-Cell supports student startups with mentoring, funding guidance, and pitch competitions. Turn your ideas into reality.", memberCount: 35, createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now() - 86400000*10).toISOString() },
  ];

  const events = [
    { id: "e1", title: "Hackathon 2026",             committeeId: "c1", committeeName: "Coding Club",        description: "A 24-hour coding marathon. Build innovative solutions to real-world problems. Cash prizes for top 3 teams!", date: new Date(Date.now()+86400000*7).toISOString(),  venue: "CS Department Lab",   maxParticipants: 100, registeredCount: 67, createdBy: "admin@vcet.edu.in" },
    { id: "e2", title: "Diwali Cultural Fest",        committeeId: "c2", committeeName: "Cultural Committee",description: "A spectacular evening of dance, music, drama, and more! Open to all students.",                        date: new Date(Date.now()+86400000*14).toISOString(), venue: "College Auditorium",  maxParticipants: 500, registeredCount: 312,createdBy: "admin@vcet.edu.in" },
    { id: "e3", title: "Tree Plantation Drive",       committeeId: "c3", committeeName: "NSS",               description: "Join us in planting 200 saplings around the campus. Be the change!",                                 date: new Date(Date.now()+86400000*3).toISOString(),  venue: "College Ground",      maxParticipants: 80,  registeredCount: 45, createdBy: "admin@vcet.edu.in" },
    { id: "e4", title: "Inter-College Cricket Tournament", committeeId: "c4", committeeName: "Sports Club",  description: "Compete against the best teams from 8 colleges in the city. Team registrations open!",                date: new Date(Date.now()+86400000*21).toISOString(), venue: "Sports Ground",       maxParticipants: 120, registeredCount: 89, createdBy: "admin@vcet.edu.in" },
  ];

  const announcements = [
    { id: "a1", committeeId: "c1", committeeName: "Coding Club",        title: "LeetCode Contest This Sunday!",    body: "Join our weekly LeetCode practice session every Sunday 10AM. Improve your DSA skills with peers. Zoom link will be shared in the group.", type: "event",     createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now()-3600000*2).toISOString() },
    { id: "a2", committeeId: "c2", committeeName: "Cultural Committee", title: "Auditions Open for Annual Day",    body: "We are looking for talented performers for our Annual Day show. Auditions will be held from Nov 5-8 in the auditorium foyer. All art forms welcome!", type: "important", createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now()-3600000*5).toISOString() },
    { id: "a3", committeeId: "c3", committeeName: "NSS",               title: "Blood Donation Camp Next Week",    body: "NSS is organizing a blood donation camp in collaboration with the Red Cross Society. All students are encouraged to participate.", type: "info", createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now()-86400000).toISOString() },
    { id: "a4", committeeId: "c4", committeeName: "Sports Club",        title: "New Gym Equipment Installed",      body: "The college gym has been upgraded with new equipment courtesy of the Sports Club. Open daily 6AM-8PM for all students.", type: "info", createdBy: "admin@vcet.edu.in", createdAt: new Date(Date.now()-86400000*2).toISOString() },
  ];

  const messages = {
    c1: [
      { id: genId(), senderId: "admin@vcet.edu.in", senderName: "Admin", message: "Welcome to the Coding Club group! 🎉 This is a private space for members to collaborate.", time: new Date(Date.now()-86400000).toISOString() },
      { id: genId(), senderId: "admin@vcet.edu.in", senderName: "Admin", message: "Our next meeting is on Saturday at 11 AM in Lab 3. Please confirm attendance.", time: new Date(Date.now()-3600000*3).toISOString() },
    ],
    c2: [
      { id: genId(), senderId: "admin@vcet.edu.in", senderName: "Admin", message: "Cultural fam! Audition schedules are posted on the notice board. Good luck everyone! 🎭", time: new Date(Date.now()-86400000).toISOString() },
    ],
  };

  const notifications = [
    { id: genId(), title: "Welcome to Committee Hub!", text: "Explore committees, join groups, and stay updated with college events.", icon: "🎉", time: new Date().toISOString(), read: false },
  ];

  setData("committees",  committees);
  setData("events",      events);
  setData("announcements", announcements);
  setData("messages",    messages);
  setData("notifications_" + user.id, notifications);
  setData("join_requests", []);
  setData("memberships", []);  // { userId, committeeId, status: pending|approved|rejected }
  setData("rsvps",       []);  // { userId, eventId }
  setData("seeded",      true);
}

// ── HELPERS ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff/60) + "m ago";
  if (diff < 86400) return Math.floor(diff/3600) + "h ago";
  return Math.floor(diff/86400) + "d ago";
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) + " at " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}
function openModal(id)  { $(id).classList.add("open"); }
function closeModal(id) { $(id).classList.remove("open"); }

// Close modals on overlay click
document.querySelectorAll(".modal-ov").forEach(ov => {
  ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("open"); });
});

// ── NAV SETUP ─────────────────────────────────────────────────
function setupNav() {
  const roleLabel = isAdmin() ? " ⚙️ Admin" : " 🎓 Student";
  if ($("navUser")) $("navUser").textContent = "Hi, " + user.name.split(" ")[0] + roleLabel;
  if ($("adminBar"))  $("adminBar").style.display = isAdmin() ? "flex" : "none";
}

function signOut() {
  sessionStorage.removeItem("hub_role");
  localStorage.removeItem("user");
  location.href = "Login.html";
}

// ── VIEWS ─────────────────────────────────────────────────────
function switchView(id, el) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".sb-btn").forEach(b => b.classList.remove("active"));
  $("view-" + id).classList.add("active");
  el.classList.add("active");
  if (id === "mygroups")     renderMyGroups();
  if (id === "notifications") renderNotifications();
  if (id === "committees")   renderCommittees();
  if (id === "events")       renderEvents();
  if (id === "feed")         renderFeed();
}

// ── HERO STATS ────────────────────────────────────────────────
function updateStats() {
  const comms = getData("committees");
  const events = getData("events");
  const members = new Set(getData("memberships").filter(m => m.status === "approved").map(m => m.userId));
  animateNum("hCommittees", comms.length);
  animateNum("hEvents", events.length);
  animateNum("hMembers", members.size + comms.reduce((a, c) => a + c.memberCount, 0));
}

function animateNum(id, target) {
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    $(id).textContent = current;
    if (current >= target) clearInterval(timer);
  }, 40);
}

// ── SIDEBAR MY COMMITTEES ─────────────────────────────────────
function renderSideCommittees() {
  const memberships = getData("memberships").filter(m => m.userId === user.id && m.status === "approved");
  const committees = getData("committees");
  const el = $("sideCommList");
  if (!memberships.length) { el.innerHTML = `<div class="sb-empty">No memberships yet</div>`; return; }
  el.innerHTML = memberships.map(m => {
    const c = committees.find(c => c.id === m.committeeId);
    if (!c) return "";
    return `<div class="sb-comm-item" onclick="openCommittee('${c.id}')">${c.icon} ${c.name}</div>`;
  }).join("");
}

// ── ACTIVITY FEED ─────────────────────────────────────────────
function renderFeed() {
  const announcements = getData("announcements");
  const events = getData("events");

  let items = [
    ...announcements.map(a => ({ ...a, _type: "announcement", _time: a.createdAt })),
    ...events.map(e => ({ ...e, _type: "event", _time: e.date }))
  ].sort((a, b) => new Date(b._time) - new Date(a._time));

  const el = $("feedContainer");
  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">📰</div><h4>No activity yet</h4><p>Posts from committees will appear here.</p></div>`;
    return;
  }

  el.innerHTML = items.map(item => {
    if (item._type === "announcement") {
      const badgeClass = item.type === "important" ? "fb-important" : item.type === "event" ? "fb-event" : "fb-info";
      return `<div class="feed-card">
        <div class="feed-icon">${getCommIcon(item.committeeId)}</div>
        <div class="feed-body">
          <div class="feed-meta">📢 ${item.committeeName} · ${timeAgo(item.createdAt)}</div>
          <div class="feed-title">${item.title}</div>
          <div class="feed-text">${item.body}</div>
          <span class="feed-badge ${badgeClass}">${item.type === "important" ? "⚠️ Important" : item.type === "event" ? "📅 Event" : "ℹ️ Info"}</span>
        </div>
      </div>`;
    } else {
      return `<div class="feed-card" onclick="openEvent('${item.id}')">
        <div class="feed-icon">${getCommIcon(item.committeeId)}</div>
        <div class="feed-body">
          <div class="feed-meta">📅 ${item.committeeName} · ${timeAgo(item.date)}</div>
          <div class="feed-title">${item.title}</div>
          <div class="feed-text">${item.description}</div>
          <div class="feed-text" style="margin-top:4px;font-size:12px;">📍 ${item.venue} · ${fmtDate(item.date)}</div>
          <span class="feed-badge fb-announcement">🎉 Event</span>
        </div>
      </div>`;
    }
  }).join("");
}

function getCommIcon(id) {
  const c = getData("committees").find(c => c.id === id);
  return c ? c.icon : "🏛️";
}

// ── COMMITTEES ────────────────────────────────────────────────
let allCommittees = [];

function renderCommittees() {
  allCommittees = getData("committees");
  filterCommittees();
}

function filterCommittees() {
  const q   = ($("commSearch")?.value || "").toLowerCase();
  const cat = $("commCatFilter")?.value || "";
  const filtered = allCommittees.filter(c =>
    (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) &&
    (!cat || c.category === cat)
  );
  renderCommitteeGrid(filtered);
}

function renderCommitteeGrid(comms) {
  const memberships = getData("memberships");
  const el = $("committeeGrid");
  if (!comms.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="ei">🔍</div><h4>No results</h4><p>Try a different search.</p></div>`;
    return;
  }
  el.innerHTML = comms.map(c => {
    const myMembership = memberships.find(m => m.userId === user.id && m.committeeId === c.id);
    const allMembers   = memberships.filter(m => m.committeeId === c.id && m.status === "approved").length;
    const totalMembers = c.memberCount + allMembers;

    let btnHtml = "";
    if (isAdmin()) {
      // Admins don't join — they manage
      btnHtml = `<button class="btn-join approved" disabled>⚙️ Admin</button>`;
    } else if (myMembership?.status === "approved") {
      btnHtml = `<button class="btn-join approved" disabled>✅ Joined</button>`;
    } else if (myMembership?.status === "pending") {
      btnHtml = `<button class="btn-join pending" disabled>⏳ Pending</button>`;
    } else if (myMembership?.status === "rejected") {
      btnHtml = `<button class="btn-join rejected" disabled>❌ Rejected</button>`;
    } else {
      btnHtml = `<button class="btn-join" onclick="requestJoin('${c.id}')">Request to Join</button>`;
    }

    return `
      <div class="comm-card">
        <div class="comm-banner">${c.icon}</div>
        <div class="comm-body">
          <div class="comm-name">${c.name}</div>
          <div class="comm-cat">${c.category}</div>
          <div class="comm-desc">${c.description}</div>
        </div>
        <div class="comm-footer">
          <span class="comm-members">👥 ${totalMembers} members</span>
          <button class="btn btn-g btn-sm" onclick="openCommittee('${c.id}')">View →</button>
        </div>
      </div>`;
  }).join("");
}

// ── JOIN REQUEST (student only) ───────────────────────────────
function requestJoin(committeeId) {
  if (isAdmin()) { toast("Admins manage committees — not join as members."); return; }
  const memberships = getData("memberships");
  const exists = memberships.find(m => m.userId === user.id && m.committeeId === committeeId);
  if (exists) { toast("Already requested!"); return; }

  const c = getData("committees").find(c => c.id === committeeId);
  memberships.push({ id: genId(), userId: user.id, userName: user.name, userEmail: user.email, committeeId, status: "pending", requestedAt: new Date().toISOString() });
  setData("memberships", memberships);

  addNotification(user.id, { icon: "⏳", title: "Join Request Sent", text: `Your request to join "${c?.name}" is pending admin approval.` });
  toast("Join request sent! ⏳");
  renderCommittees();
  renderSideCommittees();
}

// ── COMMITTEE DETAIL MODAL ────────────────────────────────────
let activeCmId = null;

function openCommittee(id) {
  activeCmId = id;
  const committees = getData("committees");
  const c = committees.find(c => c.id === id);
  if (!c) return;

  const memberships = getData("memberships");
  const myM      = memberships.find(m => m.userId === user.id && m.committeeId === id);
  const isApproved = myM?.status === "approved";
  const allApproved = memberships.filter(m => m.committeeId === id && m.status === "approved").length;
  const totalMembers = c.memberCount + allApproved;
  const eventsCount  = getData("events").filter(e => e.committeeId === id).length;
  const postsCount   = getData("announcements").filter(a => a.committeeId === id).length;

  $("cmIcon").textContent    = c.icon;
  $("cmName").textContent    = c.name;
  $("cmCat").textContent     = c.category;
  $("cmDesc").textContent    = c.description;
  $("cmMembers").textContent = totalMembers;
  $("cmEvCount").textContent = eventsCount;
  $("cmPosts").textContent   = postsCount;

  // Join area
  const joinEl = $("cmJoinArea");
  if (isAdmin()) {
    joinEl.innerHTML = `<span style="color:#7B4B2A;font-weight:700;font-size:14px;">⚙️ You are managing this committee as Admin</span>`;
  } else if (isApproved) {
    joinEl.innerHTML = `<span style="color:var(--gr);font-weight:700;font-size:14px;">✅ You are a member of this committee</span>`;
  } else if (myM?.status === "pending") {
    joinEl.innerHTML = `<span style="color:var(--am);font-weight:700;font-size:14px;">⏳ Your join request is pending approval</span>`;
  } else if (myM?.status === "rejected") {
    joinEl.innerHTML = `<span style="color:var(--rd);font-weight:700;font-size:14px;">❌ Your request was rejected</span>`;
  } else {
    joinEl.innerHTML = `<button class="btn-join" onclick="requestJoin('${id}');closeModal('committeeModal');renderCommittees()">Request to Join</button>`;
  }

  // Show private tabs for members OR admins
  const showPrivate = isApproved || isAdmin();
  $("cmPrivTab").style.display    = showPrivate ? "inline-block" : "none";
  $("cmMembersTab").style.display = showPrivate ? "inline-block" : "none";

  // Reset to about tab
  document.querySelectorAll(".cm-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".cm-panel").forEach(p => p.classList.remove("active"));
  document.querySelector(".cm-tab").classList.add("active");
  $("cmp-about").classList.add("active");

  openModal("committeeModal");
}

function cmTab(panel, el) {
  document.querySelectorAll(".cm-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".cm-panel").forEach(p => p.classList.remove("active"));
  el.classList.add("active");
  $("cmp-" + panel).classList.add("active");

  if (panel === "announcements") renderCmAnnouncements(activeCmId);
  if (panel === "events")        renderCmEvents(activeCmId);
  if (panel === "group")         renderGroupChat(activeCmId);
  if (panel === "members")       renderMembers(activeCmId);
}

function renderCmAnnouncements(id) {
  const anns = getData("announcements").filter(a => a.committeeId === id);
  const el = $("cmAnnList");
  if (!anns.length) { el.innerHTML = `<div class="empty-state"><div class="ei">📢</div><h4>No announcements yet</h4></div>`; return; }
  el.innerHTML = anns.map(a => `
    <div class="ann-item ann-${a.type}">
      <div class="ann-title">${a.title}</div>
      <div class="ann-body">${a.body}</div>
      <div class="ann-meta">Posted ${timeAgo(a.createdAt)}</div>
    </div>`).join("");
}

function renderCmEvents(id) {
  const evs = getData("events").filter(e => e.committeeId === id);
  const el = $("cmEvList");
  if (!evs.length) { el.innerHTML = `<div class="empty-state"><div class="ei">📅</div><h4>No events yet</h4></div>`; return; }
  el.innerHTML = evs.map(e => {
    const pct = e.maxParticipants ? Math.round((e.registeredCount / e.maxParticipants) * 100) : 0;
    return `<div style="background:var(--bg);border:1px solid var(--bor);border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;" onclick="closeModal('committeeModal');openEvent('${e.id}')">
      <div style="font-weight:700;font-size:15px;margin-bottom:4px;">${e.title}</div>
      <div style="font-size:12px;color:var(--tx3);margin-bottom:6px;">📅 ${fmtDate(e.date)} · 📍 ${e.venue}</div>
      ${e.maxParticipants ? `<div class="ev-prog-bar"><div class="ev-prog-fill" style="width:${pct}%"></div></div><div class="ev-prog-txt">${e.registeredCount}/${e.maxParticipants} registered</div>` : ""}
    </div>`;
  }).join("");
}

function renderMembers(id) {
  const memberships = getData("memberships");
  const approved    = memberships.filter(m => m.committeeId === id && m.status === "approved");
  const pending     = memberships.filter(m => m.committeeId === id && m.status === "pending");

  let html = `<h4 style="font-size:13px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;">Members (${approved.length})</h4>`;
  if (!approved.length) { html += `<p style="color:var(--tx3);font-size:13px;">No approved members yet.</p>`; }
  else {
    html += approved.map(m => `
      <div class="member-row">
        <div class="member-av">${(m.userName||"?")[0].toUpperCase()}</div>
        <div><div class="member-name">${m.userName}</div><div class="member-role">${m.userEmail}</div></div>
        <span class="member-badge mb-member">Member</span>
      </div>`).join("");
  }
  $("cmMemberList").innerHTML = html;

  // Pending requests — admin only
  const pEl = $("cmPendingSection");
  if (isAdmin() && pending.length) {
    pEl.innerHTML = `<h4 style="font-size:13px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px;">Pending Requests (${pending.length})</h4>` +
      pending.map(m => `
        <div class="req-row">
          <div class="member-av">${(m.userName||"?")[0].toUpperCase()}</div>
          <div class="req-info">
            <div class="req-name">${m.userName}</div>
            <div class="req-meta">${m.userEmail} · Requested ${timeAgo(m.requestedAt)}</div>
          </div>
          <div class="req-actions">
            <button class="btn-accept" onclick="adminAction('${m.id}','approved','${id}')">✓ Accept</button>
            <button class="btn-reject" onclick="adminAction('${m.id}','rejected','${id}')">✕ Reject</button>
          </div>
        </div>`).join("");
  } else if (isAdmin() && !pending.length) {
    pEl.innerHTML = `<p style="margin-top:16px;color:var(--tx3);font-size:13px;">✅ No pending requests for this committee.</p>`;
  } else {
    pEl.innerHTML = "";
  }
}

function adminAction(reqId, action, committeeId) {
  if (!isAdmin()) { toast("Admin access required."); return; }
  const memberships = getData("memberships");
  const idx = memberships.findIndex(m => m.id === reqId);
  if (idx === -1) return;
  const targetUser = memberships[idx];
  memberships[idx].status = action;
  setData("memberships", memberships);

  const c = getData("committees").find(c => c.id === committeeId);
  addNotification(targetUser.userId, {
    icon: action === "approved" ? "✅" : "❌",
    title: action === "approved" ? "Join Request Approved!" : "Join Request Rejected",
    text: `Your request to join "${c?.name}" has been ${action}.`
  });

  toast(action === "approved" ? "Request approved ✅" : "Request rejected");
  renderMembers(committeeId);
  renderSideCommittees();
  loadNotifBadge();
}

// ── GROUP CHAT ────────────────────────────────────────────────
function renderGroupChat(id) {
  const allMsgs = getData("messages");
  const msgs = allMsgs[id] || [];
  const el = $("cmChatBox");
  if (!msgs.length) {
    el.innerHTML = `<div style="text-align:center;color:var(--tx3);font-size:13px;padding:40px;">No messages yet. Say hello! 👋</div>`;
    return;
  }
  el.innerHTML = msgs.map(m => {
    const mine = m.senderId === user.email;
    return `<div class="msg ${mine ? "mine" : "theirs"}">
      ${!mine ? `<div class="msg-sender">${m.senderName}</div>` : ""}
      <div class="msg-bubble">${m.message}</div>
      <div class="msg-time">${timeAgo(m.time)}</div>
    </div>`;
  }).join("");
  el.scrollTop = el.scrollHeight;
}

function sendGroupMsg() {
  const input = $("cmChatInput");
  const text  = input.value.trim();
  if (!text || !activeCmId) return;

  const allMsgs = getData("messages");
  if (!allMsgs[activeCmId]) allMsgs[activeCmId] = [];
  allMsgs[activeCmId].push({
    id: genId(), senderId: user.email, senderName: user.name,
    message: text, time: new Date().toISOString()
  });
  setData("messages", allMsgs);
  input.value = "";
  renderGroupChat(activeCmId);
}

// ── MY GROUPS ─────────────────────────────────────────────────
function renderMyGroups() {
  const memberships = getData("memberships").filter(m => m.userId === user.id && m.status === "approved");
  const committees  = getData("committees");
  const el = $("myGroupsContent");

  // Admins see all committees' group chats
  const viewable = isAdmin()
    ? committees
    : memberships.map(m => committees.find(c => c.id === m.committeeId)).filter(Boolean);

  if (!viewable.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">🔒</div><h4>No private groups yet</h4><p>Join a committee to get access to its private group chat.</p><button class="btn btn-primary" onclick="switchView('committees',document.querySelectorAll('.sb-btn')[1])" style="margin-top:16px;">Browse Committees</button></div>`;
    return;
  }

  el.innerHTML = viewable.map(c => {
    const allMsgs = getData("messages");
    const msgs    = allMsgs[c.id] || [];
    const lastMsg = msgs[msgs.length - 1];
    return `
      <div class="group-card">
        <div class="group-card-hd">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:28px;">${c.icon}</span>
            <div><h4>${c.name}</h4><small>${msgs.length} messages · ${c.category}</small></div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openCommitteeToGroup('${c.id}')">Open Chat →</button>
        </div>
        ${lastMsg ? `<div style="padding:12px 16px;font-size:13px;color:var(--tx3);border-bottom:1px solid var(--bor);">
          <b>${lastMsg.senderName}:</b> ${lastMsg.message}
        </div>` : ""}
      </div>`;
  }).join("");
}

function openCommitteeToGroup(id) {
  openCommittee(id);
  setTimeout(() => { const t = $("cmPrivTab"); if (t) t.click(); }, 100);
}

// ── EVENTS ────────────────────────────────────────────────────
function renderEvents() {
  const events = getData("events").sort((a, b) => new Date(a.date) - new Date(b.date));
  const el = $("eventsGrid");
  if (!events.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="ei">📅</div><h4>No upcoming events</h4><p>Check back soon!</p></div>`;
    return;
  }
  el.innerHTML = events.map(e => {
    const pct     = e.maxParticipants ? Math.round((e.registeredCount / e.maxParticipants) * 100) : 0;
    const rsvps   = getData("rsvps");
    const isRsvped = rsvps.some(r => r.userId === user.id && r.eventId === e.id);
    return `
      <div class="ev-card" onclick="openEvent('${e.id}')">
        <div class="ev-header">
          <div class="ev-date-pill">📅 ${new Date(e.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
          <h3>${e.title}</h3>
        </div>
        <div class="ev-body">
          <div class="ev-row"><span>📍</span><span>${e.venue}</span></div>
          <div class="ev-row"><span>🏛️</span><span>${e.committeeName}</span></div>
          ${e.maxParticipants
            ? `<div class="ev-progress">
                <div class="ev-prog-txt">${e.registeredCount}/${e.maxParticipants} registered</div>
                <div class="ev-prog-bar"><div class="ev-prog-fill" style="width:${Math.min(pct,100)}%"></div></div>
               </div>`
            : `<div class="ev-row"><span>👥</span><span>${e.registeredCount} registered</span></div>`}
        </div>
        <div class="ev-footer">
          <span class="ev-comm-tag">${e.committeeName}</span>
          <span style="font-size:12px;font-weight:700;color:${isRsvped?"var(--gr)":"var(--br)"};">${isRsvped ? "✅ Registered" : "Register →"}</span>
        </div>
      </div>`;
  }).join("");
}

function openEvent(id) {
  const events = getData("events");
  const e = events.find(e => e.id === id);
  if (!e) return;

  $("evmTitle").textContent  = e.title;
  $("evmDate").textContent   = fmtDate(e.date);
  $("evmVenue").textContent  = e.venue;
  $("evmComm").textContent   = e.committeeName;
  $("evmDesc").textContent   = e.description;

  const pct = e.maxParticipants ? Math.round((e.registeredCount / e.maxParticipants) * 100) : null;
  $("evmCount").textContent = e.maxParticipants
    ? `${e.registeredCount} / ${e.maxParticipants} (${pct}% full)`
    : `${e.registeredCount} registered`;

  const rsvps   = getData("rsvps");
  const isRsvped = rsvps.some(r => r.userId === user.id && r.eventId === id);
  const isFull   = e.maxParticipants > 0 && e.registeredCount >= e.maxParticipants;

  const rsvpEl = $("evmRsvpArea");
  if (isAdmin()) {
    // Admin sees stats only, no RSVP
    rsvpEl.innerHTML = `<div style="font-size:13px;color:#7B4B2A;font-weight:600;padding:10px 0;">⚙️ Viewing as Admin — ${e.registeredCount} registrations so far.</div>`;
  } else if (isRsvped) {
    rsvpEl.innerHTML = `<button class="btn-rsvp registered" disabled>✅ You're Registered</button>`;
  } else if (isFull) {
    rsvpEl.innerHTML = `<button class="btn-rsvp" disabled style="background:var(--bg3);color:var(--tx3);cursor:not-allowed;">Event Full</button>`;
  } else {
    rsvpEl.innerHTML = `<button class="btn-rsvp" onclick="rsvpEvent('${id}')">Register for Event</button>`;
  }

  openModal("eventModal");
}

function rsvpEvent(id) {
  if (isAdmin()) { toast("Admins cannot RSVP for events."); return; }
  const events = getData("events");
  const rsvps  = getData("rsvps");
  const idx    = events.findIndex(e => e.id === id);
  if (idx === -1) return;

  rsvps.push({ userId: user.id, eventId: id, time: new Date().toISOString() });
  events[idx].registeredCount++;
  setData("rsvps",  rsvps);
  setData("events", events);

  addNotification(user.id, {
    icon: "🎟️", title: "Event Registration Confirmed",
    text: `You're registered for "${events[idx].title}". See you there!`
  });

  toast("Successfully registered! 🎉");
  closeModal("eventModal");
  renderEvents();
  loadNotifBadge();
}

// ── ANNOUNCEMENTS (admin create) ──────────────────────────────
function openCreateAnnouncement() {
  if (!isAdmin()) { toast("Admin access required."); return; }
  const comms = getData("committees");
  const sel = $("annComm");
  sel.innerHTML = comms.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join("");
  openModal("createAnnouncementModal");
}

function createAnnouncement() {
  if (!isAdmin()) { toast("Admin access required."); return; }
  const title  = $("annTitle").value.trim();
  const body   = $("annBody").value.trim();
  const type   = $("annType").value;
  const commId = $("annComm").value;
  if (!title || !body) { toast("Please fill all fields"); return; }

  const comms = getData("committees");
  const c = comms.find(c => c.id === commId);
  const anns = getData("announcements");
  anns.unshift({ id: genId(), committeeId: commId, committeeName: c?.name, title, body, type, createdBy: user.email, createdAt: new Date().toISOString() });
  setData("announcements", anns);

  const memberships = getData("memberships").filter(m => m.committeeId === commId && m.status === "approved");
  memberships.forEach(m => {
    addNotification(m.userId, { icon: "📢", title: `New Announcement: ${title}`, text: `From ${c?.name}: ${body.slice(0, 80)}...` });
  });

  closeModal("createAnnouncementModal");
  $("annTitle").value = ""; $("annBody").value = "";
  toast("Announcement posted! 📢");
  renderFeed();
  updateStats();
}

// ── EVENTS (admin create) ─────────────────────────────────────
function openCreateEvent() {
  if (!isAdmin()) { toast("Admin access required."); return; }
  const comms = getData("committees");
  const sel = $("evComm");
  sel.innerHTML = comms.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join("");
  openModal("createEventModal");
}

function createEventHandler() {
  if (!isAdmin()) { toast("Admin access required."); return; }
  const title  = $("evTitle").value.trim();
  const desc   = $("evDesc").value.trim();
  const date   = $("evDate").value;
  const venue  = $("evVenue").value.trim();
  const max    = parseInt($("evMax").value) || 0;
  const commId = $("evComm").value;
  if (!title || !desc || !date || !venue) { toast("Please fill all fields"); return; }

  const comms = getData("committees");
  const c = comms.find(c => c.id === commId);
  const events = getData("events");
  events.push({ id: genId(), title, description: desc, date: new Date(date).toISOString(), venue, maxParticipants: max, registeredCount: 0, committeeId: commId, committeeName: c?.name, createdBy: user.email });
  setData("events", events);

  closeModal("createEventModal");
  $("evTitle").value = ""; $("evDesc").value = ""; $("evDate").value = ""; $("evVenue").value = "";
  toast("Event created! 📅");
  renderFeed();
  renderEvents();
  updateStats();
}

// ── COMMITTEE (admin create) ──────────────────────────────────
function createCommittee() {
  if (!isAdmin()) { toast("Admin access required."); return; }
  const name = $("cName").value.trim();
  const desc = $("cDesc").value.trim();
  const cat  = $("cCat").value;
  const icon = $("cIcon").value.trim() || "🏛️";
  if (!name || !desc) { toast("Please fill all fields"); return; }

  const newId = genId();
  const comms = getData("committees");
  comms.push({ id: newId, name, description: desc, category: cat, icon, memberCount: 0, createdBy: user.email, createdAt: new Date().toISOString() });
  setData("committees", comms);

  closeModal("createCommitteeModal");
  $("cName").value = ""; $("cDesc").value = "";
  toast("Committee created! 🏛️");
  renderCommittees();
  renderSideCommittees();
  updateStats();
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
function addNotification(userId, { icon, title, text }) {
  const key = "notifications_" + userId;
  const notifs = getData(key, []);
  notifs.unshift({ id: genId(), icon, title, text, time: new Date().toISOString(), read: false });
  setData(key, notifs);
}

function loadNotifBadge() {
  const notifs = getData("notifications_" + user.id, []);
  const unread = notifs.filter(n => !n.read).length;
  const badge  = $("notifBadge");
  if (badge) {
    if (unread > 0) { badge.textContent = unread; badge.style.display = "inline-block"; }
    else { badge.style.display = "none"; }
  }
}

function renderNotifications() {
  const notifs  = getData("notifications_" + user.id, []);
  const el = $("notifList");

  const updated = notifs.map(n => ({ ...n, read: true }));
  setData("notifications_" + user.id, updated);
  loadNotifBadge();

  if (!notifs.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">🔔</div><h4>No notifications</h4><p>You're all caught up!</p></div>`;
    return;
  }
  el.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? "" : "unread"}">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${timeAgo(n.time)}</div>
      </div>
    </div>`).join("");
}

// ── ADMIN: VIEW ALL REQUESTS ──────────────────────────────────
function openAdminRequests() {
  if (!isAdmin()) { toast("Admin access required."); return; }
  const committees = getData("committees");
  const memberships = getData("memberships").filter(m => m.status === "pending");

  const el = $("adminReqList");
  if (!memberships.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">✅</div><h4>No pending requests</h4><p>All requests have been handled.</p></div>`;
  } else {
    el.innerHTML = memberships.map(m => {
      const c = committees.find(c => c.id === m.committeeId);
      return `<div class="req-row">
        <div class="member-av">${(m.userName||"?")[0].toUpperCase()}</div>
        <div class="req-info">
          <div class="req-name">${m.userName}</div>
          <div class="req-meta">${m.userEmail} · Wants to join ${c?.icon} ${c?.name} · ${timeAgo(m.requestedAt)}</div>
        </div>
        <div class="req-actions">
          <button class="btn-accept" onclick="adminAction('${m.id}','approved','${m.committeeId}');openAdminRequests()">✓ Accept</button>
          <button class="btn-reject" onclick="adminAction('${m.id}','rejected','${m.committeeId}');openAdminRequests()">✕ Reject</button>
        </div>
      </div>`;
    }).join("");
  }
  openModal("adminRequestsModal");
}

// ── INIT ──────────────────────────────────────────────────────
function init() {
  seedDefaultData();
  setupNav();
  updateStats();
  renderFeed();
  renderSideCommittees();
  loadNotifBadge();
}

// Auto-init if role already set (came from sessionStorage)
if (currentRole) init();