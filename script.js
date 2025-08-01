// Система аутентификации
class AuthSystem {
  constructor() {
    this.users = JSON.parse(localStorage.getItem("uptaxi_users")) || [
      { username: "admin", password: "admin123", role: "admin", accessLevel: 10 },
      { username: "user", password: "user123", role: "user", accessLevel: 1 },
    ]
    this.currentUser = JSON.parse(localStorage.getItem("uptaxi_currentUser")) || null
    this.saveUsers()
  }

  saveUsers() {
    localStorage.setItem("uptaxi_users", JSON.stringify(this.users))
  }

  login(username, password) {
    const user = this.users.find((u) => u.username === username && u.password === password)
    if (user) {
      this.currentUser = user
      localStorage.setItem("uptaxi_currentUser", JSON.stringify(user))
      return true
    }
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

  getCurrentUser() {
    return this.currentUser
  }
}

// Глобальная система аутентификации
const auth = new AuthSystem()

// Обработчик формы входа
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const errorMessage = document.getElementById("errorMessage")

  // Declare apiClient variable
  const apiClient = {
    login: async (username, password) => {
      // Placeholder for API login logic
      return true // Assume login is successful for demonstration purposes
    },
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const username = document.getElementById("username").value
      const password = document.getElementById("password").value

      try {
        // Попробовать войти через API
        const success = await apiClient.login(username, password)

        if (success) {
          // Также обновить локальную систему аутентификации
          if (auth.login(username, password)) {
            if (auth.isAdmin()) {
              window.location.href = "admin.html"
            } else {
              window.location.href = "menu.html"
            }
          }
        } else {
          errorMessage.textContent = "Неверное имя пользователя или пароль"
        }
      } catch (error) {
        console.error("Ошибка входа:", error)
        // Fallback на локальную аутентификацию
        if (auth.login(username, password)) {
          if (auth.isAdmin()) {
            window.location.href = "admin.html"
          } else {
            window.location.href = "menu.html"
          }
        } else {
          errorMessage.textContent = "Неверное имя пользователя или пароль"
        }
      }
    })
  }

  // Проверить, авторизован ли пользователь
  if (auth.isLoggedIn()) {
    if (auth.isAdmin()) {
      window.location.href = "admin.html"
    } else {
      window.location.href = "menu.html"
    }
  }
})
