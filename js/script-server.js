// Declare apiClient variable before using it
const apiClient = {
  currentUser: null,
  login: async (username, password) => {
    // Simulate login logic
    return true
  },
  logout: () => {
    // Simulate logout logic
  },
  isLoggedIn: () => {
    // Simulate isLoggedIn logic
    return apiClient.currentUser !== null
  },
  isAdmin: () => {
    // Simulate isAdmin logic
    return false
  },
}

// Updated authentication system for server-side
class AuthSystem {
  constructor() {
    this.currentUser = apiClient.currentUser
  }

  async login(username, password) {
    const success = await apiClient.login(username, password)
    if (success) {
      this.currentUser = apiClient.currentUser
    }
    return success
  }

  logout() {
    apiClient.logout()
  }

  isLoggedIn() {
    return apiClient.isLoggedIn()
  }

  isAdmin() {
    return apiClient.isAdmin()
  }
}

// Global auth instance
const auth = new AuthSystem()

// Updated form handler for login
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const errorMessage = document.getElementById("error-message")

    try {
      if (await auth.login(username, password)) {
        window.location.href = "menu.html"
      } else {
        errorMessage.textContent = "Неверный логин или пароль"
        errorMessage.classList.add("show")
        setTimeout(() => {
          errorMessage.classList.remove("show")
        }, 3000)
      }
    } catch (error) {
      errorMessage.textContent = "Ошибка подключения к серверу"
      errorMessage.classList.add("show")
      setTimeout(() => {
        errorMessage.classList.remove("show")
      }, 3000)
    }
  })
}

// Logout function
function logout() {
  auth.logout()
}
