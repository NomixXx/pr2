// Упрощенная версия скрипта авторизации
console.log("Simple auth script loaded")

// Простая система авторизации без API
class SimpleAuth {
  constructor() {
    this.users = {
      admin: { password: "admin123", role: "admin", accessLevel: 10 },
      user: { password: "user123", role: "user", accessLevel: 1 },
    }
    this.currentUser = JSON.parse(localStorage.getItem("uptaxi_currentUser")) || null
  }

  login(username, password) {
    console.log("Attempting login:", username)

    if (this.users[username] && this.users[username].password === password) {
      this.currentUser = {
        username: username,
        role: this.users[username].role,
        accessLevel: this.users[username].accessLevel,
      }

      localStorage.setItem("uptaxi_currentUser", JSON.stringify(this.currentUser))
      console.log("Login successful:", this.currentUser)
      return true
    }

    console.log("Login failed for:", username)
    return false
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem("uptaxi_currentUser")
    window.location.href = "index.html"
  }

  isLoggedIn() {
    return this.currentUser !== null
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === "admin"
  }
}

// Глобальный экземпляр
const auth = new SimpleAuth()

// Обработчик формы входа
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const username = document.getElementById("username").value
      const password = document.getElementById("password").value
      const errorMessage = document.getElementById("error-message")

      console.log("Form submitted:", { username, password })

      if (auth.login(username, password)) {
        console.log("Redirecting to menu...")
        window.location.href = "menu.html"
      } else {
        errorMessage.textContent = "Неверный логин или пароль"
        errorMessage.classList.add("show")
        setTimeout(() => {
          errorMessage.classList.remove("show")
        }, 3000)
      }
    })
  }
})

// Функция выхода
function logout() {
  auth.logout()
}
