// Отладочная версия авторизации
console.log("Debug auth script loaded")

// Переопределяем форму входа
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    console.log("Login form found")

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Form submitted")

      const username = document.getElementById("username").value
      const password = document.getElementById("password").value
      const errorMessage = document.getElementById("error-message")

      console.log("Attempting login:", { username, passwordLength: password.length })

      // Очистить предыдущие ошибки
      errorMessage.textContent = ""
      errorMessage.classList.remove("show")

      try {
        // Тест 1: Простая авторизация
        console.log("Testing simple auth...")
        const response = await fetch("/api/simple-auth.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })

        console.log("Response status:", response.status)
        const data = await response.json()
        console.log("Response data:", data)

        if (data.success) {
          console.log("Login successful, redirecting...")
          // Сохранить пользователя в localStorage
          localStorage.setItem("uptaxi_currentUser", JSON.stringify(data.user))

          // Перенаправить
          window.location.href = "menu.html"
        } else {
          console.log("Login failed:", data)
          errorMessage.textContent = data.error || "Ошибка входа"
          errorMessage.classList.add("show")
        }
      } catch (error) {
        console.error("Login error:", error)
        errorMessage.textContent = "Ошибка подключения: " + error.message
        errorMessage.classList.add("show")
      }
    })
  } else {
    console.log("Login form not found")
  }
})

// Функция для тестирования API
async function testAPI() {
  console.log("Testing API connection...")

  try {
    const response = await fetch("/api/test-auth.php")
    const data = await response.json()
    console.log("API test result:", data)
    return data
  } catch (error) {
    console.error("API test failed:", error)
    return { status: "error", message: error.message }
  }
}

// Автоматический тест при загрузке
testAPI()
