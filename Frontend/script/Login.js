function showLogin() {
  document.getElementById('loginBox').classList.remove('hidden');
  document.getElementById('registerBox').classList.add('hidden');
}

function showRegister() {
  document.getElementById('registerBox').classList.remove('hidden');
  document.getElementById('loginBox').classList.add('hidden');
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn      = document.getElementById("registerBtn");
  const name     = document.getElementById("regName").value.trim();
  const email    = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;

  if (!email.endsWith("@vcet.edu.in")) {
    alert("Only VCET college email (@vcet.edu.in) is allowed!");
    return;
  }

  btn.disabled = true; btn.textContent = "Creating account…";

  try {
    const res  = await fetch("http://localhost:5000/api/register", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) showLogin();
  } catch {
    alert("Server not reachable. Make sure it's running on port 5000.");
  } finally {
    btn.disabled = false; btn.textContent = "Create Account";
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn      = document.getElementById("loginBtn");
  const email    = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  btn.disabled = true; btn.textContent = "Signing in…";

  try {
    const res  = await fetch("http://localhost:5000/api/login", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      const redirect = localStorage.getItem('redirect_after_login');
      localStorage.removeItem('redirect_after_login');
      window.location.href = redirect || "marketplace.html";
    } else {
      alert(data.message || "Login failed");
      btn.disabled = false; btn.textContent = "Sign In";
    }
  } catch {
    alert("Server not reachable. Make sure it's running on port 5000.");
    btn.disabled = false; btn.textContent = "Sign In";
  }
});