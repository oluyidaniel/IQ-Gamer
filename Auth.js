document.addEventListener("DOMContentLoaded", () => {
  const loaderText = document.getElementById("loaderText");
  const authSection = document.getElementById("auth-section");
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const toggleLink = document.getElementById("toggle-link");
  const formTitle = document.getElementById("form-title");

  // Show loader animation
  setTimeout(() => {
    loaderText.classList.remove("hidden");
    loaderText.classList.add("show");
  }, 1500);

  // Hide loader and show auth form
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
    authSection.classList.remove("hidden");
  }, 3000);

  // Toggle between login/register
  toggleLink.addEventListener("click", () => {
    if (registerForm.classList.contains("hidden")) {
      showRegisterForm();
    } else {
      showLoginForm();
    }
  });

  function showLoginForm() {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    formTitle.innerText = "Login";
    toggleLink.innerText = "Don't have an account? Register here";
  }

  function showRegisterForm() {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    formTitle.innerText = "Register";
    toggleLink.innerText = "Already have an account? Login here";
  }

  // Handle registration
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-user").value.trim();
    const fullname = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const confirmPassword = document.getElementById("reg-con-password").value.trim();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Save to localStorage (replace with backend call later)
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.email === email)) {
      alert("Email already registered.");
      return;
    }

    users.push({ username, fullname, email, password, score: 0 });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful. Please login.");
    showLoginForm();
  });

  // Handle login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-user").value.trim();
    const password = document.getElementById("login-password").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      alert("Invalid username or password.");
      return;
    }

    localStorage.setItem("quizPlayerName", user.fullname);
    localStorage.setItem("quizPlayerEmail", user.email);
    window.location.href = "quiz.html";
  });
});
