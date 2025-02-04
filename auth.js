// Funcție pentru criptarea parolei
function hashPassword(password) {
  // În practică, ar trebui să folosești o funcție de hash mai puternică
  return btoa(password); // Folosim base64 doar pentru demonstrație
}

// Funcție pentru validarea datelor de înregistrare
function validateRegistration(username, password) {
  if (username.length < 3) {
    throw new Error(
      "Numele de utilizator trebuie să aibă cel puțin 3 caractere!"
    );
  }
  if (password.length < 6) {
    throw new Error("Parola trebuie să aibă cel puțin 6 caractere!");
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Parola trebuie să conțină cel puțin o literă mare!");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Parola trebuie să conțină cel puțin un număr!");
  }
}

// Funcție pentru înregistrare
function register(username, password) {
  try {
    validateRegistration(username, password);

    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some((user) => user.username === username)) {
      throw new Error("Numele de utilizator este deja folosit!");
    }

    const hashedPassword = hashPassword(password);
    const newUser = {
      username,
      password: hashedPassword,
      shoppingList: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    showMessage("success", "Cont creat cu succes! Te poți autentifica acum.");
    showLogin();
  } catch (error) {
    showMessage("error", error.message);
  }
}

// Funcție pentru autentificare
function login(username, password) {
  try {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const hashedPassword = hashPassword(password);
    const user = users.find(
      (u) => u.username === username && u.password === hashedPassword
    );

    if (!user) {
      throw new Error("Nume de utilizator sau parolă incorectă!");
    }

    // Creăm o sesiune pentru utilizator
    const session = {
      username: user.username,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 ore
    };

    localStorage.setItem("currentSession", JSON.stringify(session));
    localStorage.setItem("currentUser", JSON.stringify(user));
    showMessage("success", "Autentificare reușită!");
    showApp();
  } catch (error) {
    showMessage("error", error.message);
  }
}

// Funcție pentru deconectare
function logout() {
  localStorage.removeItem("currentSession");
  localStorage.removeItem("currentUser");
  showLogin();
  showMessage("success", "Te-ai deconectat cu succes!");
}

// Funcție pentru verificarea sesiunii
function checkSession() {
  const session = JSON.parse(localStorage.getItem("currentSession"));
  if (!session) return false;

  const expiresAt = new Date(session.expiresAt);
  if (expiresAt < new Date()) {
    logout();
    showMessage(
      "info",
      "Sesiunea a expirat. Te rugăm să te autentifici din nou."
    );
    return false;
  }
  return true;
}

// Funcție pentru afișarea mesajelor
function showMessage(type, message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Verifică sesiunea la fiecare acțiune importantă
function checkLoggedIn() {
  if (checkSession()) {
    showApp();
  } else {
    showLogin();
  }
}

// Adaugă CSS pentru mesaje
const style = document.createElement("style");
style.textContent = `
.message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px;
    border-radius: 5px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.5s ease-out;
}

.success {
    background-color: #27ae60;
}

.error {
    background-color: #e74c3c;
}

.info {
    background-color: #3498db;
}

@keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}
`;
document.head.appendChild(style);
