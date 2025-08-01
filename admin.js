// Import or declare the auth and apiClient variables before using them
const auth = {
  isLoggedIn: () => true, // Example implementation
  isAdmin: () => true, // Example implementation
  currentUser: { username: "Admin" }, // Example implementation
  users: [], // Example implementation
  saveUsers: () => {}, // Example implementation
}

const apiClient = {
  getSections: () => Promise.resolve([]), // Example implementation
  getUsers: () => Promise.resolve([]), // Example implementation
  getAccessLevels: () => Promise.resolve([]), // Example implementation
  getActivities: () => Promise.resolve([]), // Example implementation
  createSection: () => Promise.resolve({ success: true }), // Example implementation
  updateSection: () => Promise.resolve({ success: true }), // Example implementation
  deleteSection: () => Promise.resolve({ success: true }), // Example implementation
  createUser: () => Promise.resolve({ success: true }), // Example implementation
  updateUser: () => Promise.resolve({ success: true }), // Example implementation
  deleteUser: () => Promise.resolve({ success: true }), // Example implementation
  createContent: () => Promise.resolve({ success: true, id: Date.now() }), // Example implementation
  createGoogleDoc: () => Promise.resolve({ success: true, id: Date.now() }), // Example implementation
  createActivity: () => Promise.resolve({ success: true, id: Date.now() }), // Example implementation
  deleteActivity: () => Promise.resolve({ success: true }), // Example implementation
  createAccessLevel: () => Promise.resolve({ success: true, id: Date.now() }), // Example implementation
  updateAccessLevel: () => Promise.resolve({ success: true }), // Example implementation
  deleteAccessLevel: () => Promise.resolve({ success: true }), // Example implementation
  getContent: () => Promise.resolve({ content: [], googleDocs: [], files: [] }), // Example implementation
  deleteContent: () => Promise.resolve({ success: true }), // Example implementation
  deleteFile: () => Promise.resolve({ success: true }), // Example implementation
  deleteGoogleDoc: () => Promise.resolve({ success: true }), // Example implementation
  updateContent: () => Promise.resolve({ success: true }), // Example implementation
  uploadFile: () => Promise.resolve({ success: true }), // Example implementation
}

// Проверка авторизации при загрузке страницы
function checkAdminAuth() {
  if (!auth.isLoggedIn() || !auth.isAdmin()) {
    alert("Доступ запрещен! Требуются права администратора.")
    window.location.href = "index.html"
    return false
  }
  return true
}

// Система управления разделами с API интеграцией
class AdminSectionManager {
  constructor() {
    this.sections = []
    this.users = []
    this.content = {}
    this.googleDocs = []
    this.files = []
    this.activities = []
    this.accessLevels = []

    // Загрузить данные с сервера
    this.loadFromServer()
  }

  async loadFromServer() {
    try {
      // Загрузить разделы
      this.sections = await apiClient.getSections()

      // Загрузить пользователей
      if (auth.isAdmin()) {
        this.users = await apiClient.getUsers()
      }

      // Загрузить уровни доступа
      this.accessLevels = await apiClient.getAccessLevels()

      // Загрузить активности
      this.activities = await apiClient.getActivities()

      console.log("Данные загружены с сервера:", {
        sections: this.sections.length,
        users: this.users.length,
        accessLevels: this.accessLevels.length,
        activities: this.activities.length,
      })
    } catch (error) {
      console.error("Ошибка загрузки данных с сервера:", error)
      // Fallback на localStorage
      this.loadFromLocalStorage()
    }
  }

  loadFromLocalStorage() {
    this.sections = JSON.parse(localStorage.getItem("uptaxi_sections")) || []
    this.users = JSON.parse(localStorage.getItem("uptaxi_users")) || []
    this.content = JSON.parse(localStorage.getItem("uptaxi_content")) || {}
    this.googleDocs = JSON.parse(localStorage.getItem("uptaxi_googleDocs")) || []
    this.files = JSON.parse(localStorage.getItem("uptaxi_files")) || []
    this.activities = JSON.parse(localStorage.getItem("uptaxi_activities")) || []
    this.accessLevels = JSON.parse(localStorage.getItem("uptaxi_accessLevels")) || [
      { id: 1, name: "Базовый", description: "Базовый уровень доступа" },
      { id: 2, name: "Расширенный", description: "Расширенный уровень доступа" },
      { id: 3, name: "Полный", description: "Полный уровень доступа" },
    ]
  }

  async createSection(name, icon, accessLevel) {
    try {
      const result = await apiClient.createSection({
        name: name,
        icon: icon,
        accessLevel: Number.parseInt(accessLevel),
      })

      if (result.success) {
        // Обновить локальные данные
        await this.loadFromServer()
        return result
      }
    } catch (error) {
      console.error("Ошибка создания раздела:", error)
      // Fallback на localStorage
      const newSection = {
        id: "section" + Date.now(),
        name: name,
        icon: icon,
        accessLevel: Number.parseInt(accessLevel),
        subsections: [
          { id: "subsection1", name: "Подраздел 1", accessLevel: Number.parseInt(accessLevel) },
          { id: "subsection2", name: "Подраздел 2", accessLevel: Number.parseInt(accessLevel) },
          { id: "subsection3", name: "Подраздел 3", accessLevel: Number.parseInt(accessLevel) },
        ],
      }
      this.sections.push(newSection)
      localStorage.setItem("uptaxi_sections", JSON.stringify(this.sections))
      return newSection
    }
  }

  async updateSection(sectionId, name, icon, accessLevel, subsections) {
    try {
      const result = await apiClient.updateSection({
        id: sectionId,
        name: name,
        icon: icon,
        accessLevel: Number.parseInt(accessLevel),
        subsections: subsections,
      })

      if (result.success) {
        await this.loadFromServer()
        return true
      }
    } catch (error) {
      console.error("Ошибка обновления раздела:", error)
      // Fallback на localStorage
      const sectionIndex = this.sections.findIndex((s) => s.id === sectionId)
      if (sectionIndex !== -1) {
        this.sections[sectionIndex].name = name
        this.sections[sectionIndex].icon = icon
        this.sections[sectionIndex].accessLevel = Number.parseInt(accessLevel)
        this.sections[sectionIndex].subsections = subsections
        localStorage.setItem("uptaxi_sections", JSON.stringify(this.sections))
        return true
      }
    }
    return false
  }

  async deleteSection(sectionId) {
    try {
      const result = await apiClient.deleteSection(sectionId)
      if (result.success) {
        await this.loadFromServer()
        return true
      }
    } catch (error) {
      console.error("Ошибка удаления раздела:", error)
      // Fallback на localStorage
      this.sections = this.sections.filter((s) => s.id !== sectionId)
      localStorage.setItem("uptaxi_sections", JSON.stringify(this.sections))
    }
  }

  async createUser(username, password, role, accessLevel) {
    try {
      const result = await apiClient.createUser({
        username: username,
        password: password,
        role: role,
        accessLevel: Number.parseInt(role === "admin" ? 10 : accessLevel || 1),
      })

      if (result.success) {
        await this.loadFromServer()
        return result
      }
    } catch (error) {
      console.error("Ошибка создания пользователя:", error)
      // Fallback на localStorage
      const newUser = {
        username: username,
        password: password,
        role: role,
        accessLevel: Number.parseInt(role === "admin" ? 10 : accessLevel || 1),
      }
      this.users.push(newUser)
      localStorage.setItem("uptaxi_users", JSON.stringify(this.users))
      auth.users = this.users
      auth.saveUsers()
      return newUser
    }
  }

  async updateUser(oldUsername, newUsername, newPassword, newRole, newAccessLevel) {
    try {
      const user = this.users.find((u) => u.username === oldUsername)
      if (!user) return false

      const result = await apiClient.updateUser({
        id: user.id,
        username: newUsername,
        password: newPassword,
        role: newRole,
        accessLevel: Number.parseInt(newRole === "admin" ? 10 : newAccessLevel),
      })

      if (result.success) {
        await this.loadFromServer()
        return true
      }
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error)
      // Fallback на localStorage
      const userIndex = this.users.findIndex((u) => u.username === oldUsername)
      if (userIndex !== -1) {
        this.users[userIndex].username = newUsername
        this.users[userIndex].password = newPassword
        this.users[userIndex].role = newRole
        this.users[userIndex].accessLevel = Number.parseInt(newRole === "admin" ? 10 : newAccessLevel)
        localStorage.setItem("uptaxi_users", JSON.stringify(this.users))
        auth.users = this.users
        auth.saveUsers()
        return true
      }
    }
    return false
  }

  async deleteUser(username) {
    try {
      const user = this.users.find((u) => u.username === username)
      if (!user) return

      const result = await apiClient.deleteUser(user.id)
      if (result.success) {
        await this.loadFromServer()
      }
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error)
      // Fallback на localStorage
      this.users = this.users.filter((u) => u.username !== username)
      localStorage.setItem("uptaxi_users", JSON.stringify(this.users))
      auth.users = this.users
      auth.saveUsers()
    }
  }

  async addContent(section, subsection, title, description) {
    try {
      const result = await apiClient.createContent({
        sectionId: section,
        subsectionId: subsection,
        title: title,
        description: description,
      })

      if (result.success) {
        // Обновить локальный кеш
        const key = `${section}_${subsection}`
        if (!this.content[key]) this.content[key] = []
        this.content[key].push({
          id: result.id,
          title: title,
          description: description,
          createdAt: new Date().toLocaleDateString(),
        })
        return result
      }
    } catch (error) {
      console.error("Ошибка добавления контента:", error)
      // Fallback на localStorage
      const key = `${section}_${subsection}`
      if (!this.content[key]) this.content[key] = []
      this.content[key].push({
        id: Date.now(),
        title: title,
        description: description,
        createdAt: new Date().toLocaleDateString(),
      })
      localStorage.setItem("uptaxi_content", JSON.stringify(this.content))
    }
  }

  async addGoogleDoc(title, url, sectionId, subsectionId) {
    try {
      const result = await apiClient.createGoogleDoc({
        title: title,
        url: url,
        sectionId: sectionId,
        subsectionId: subsectionId,
      })

      if (result.success) {
        this.googleDocs.push({
          id: result.id,
          title: title,
          url: url,
          sectionId: sectionId,
          subsectionId: subsectionId,
          createdAt: new Date().toLocaleDateString(),
        })
        return result
      }
    } catch (error) {
      console.error("Ошибка добавления документа:", error)
      // Fallback на localStorage
      this.googleDocs.push({
        id: Date.now(),
        title: title,
        url: url,
        sectionId: sectionId,
        subsectionId: subsectionId,
        createdAt: new Date().toLocaleDateString(),
      })
      localStorage.setItem("uptaxi_googleDocs", JSON.stringify(this.googleDocs))
    }
  }

  async addActivity(title, icon) {
    try {
      const result = await apiClient.createActivity({
        title: title,
        icon: icon,
      })

      if (result.success) {
        this.activities.push({
          id: result.id,
          title: title,
          icon: icon,
          date: new Date().toLocaleDateString("ru-RU"),
          createdAt: new Date().toLocaleDateString("ru-RU"),
        })
        return result
      }
    } catch (error) {
      console.error("Ошибка добавления активности:", error)
      // Fallback на localStorage
      this.activities.push({
        id: Date.now(),
        title: title,
        icon: icon,
        date: new Date().toLocaleDateString("ru-RU"),
        createdAt: new Date().toLocaleDateString("ru-RU"),
      })
      localStorage.setItem("uptaxi_activities", JSON.stringify(this.activities))
    }
  }

  async deleteActivity(id) {
    try {
      const result = await apiClient.deleteActivity(id)
      if (result.success) {
        this.activities = this.activities.filter((activity) => activity.id !== id)
      }
    } catch (error) {
      console.error("Ошибка удаления активности:", error)
      // Fallback на localStorage
      this.activities = this.activities.filter((activity) => activity.id !== id)
      localStorage.setItem("uptaxi_activities", JSON.stringify(this.activities))
    }
  }

  async createAccessLevel(name, description) {
    try {
      const result = await apiClient.createAccessLevel({
        name: name,
        description: description,
      })

      if (result.success) {
        await this.loadFromServer()
        return result
      }
    } catch (error) {
      console.error("Ошибка создания уровня доступа:", error)
      // Fallback на localStorage
      let nextId = 1
      const existingIds = this.accessLevels.map((level) => Number.parseInt(level.id))

      for (let i = 1; i <= 10; i++) {
        if (!existingIds.includes(i)) {
          nextId = i
          break
        }
      }

      if (nextId > 10) {
        alert("Максимальное количество уровней доступа: 10")
        return null
      }

      const newLevel = {
        id: nextId,
        name: name,
        description: description,
      }
      this.accessLevels.push(newLevel)
      localStorage.setItem("uptaxi_accessLevels", JSON.stringify(this.accessLevels))
      return newLevel
    }
  }

  async updateAccessLevel(id, name, description) {
    try {
      const result = await apiClient.updateAccessLevel({
        id: id,
        name: name,
        description: description,
      })

      if (result.success) {
        await this.loadFromServer()
        return true
      }
    } catch (error) {
      console.error("Ошибка обновления уровня доступа:", error)
      // Fallback на localStorage
      const levelIndex = this.accessLevels.findIndex((l) => l.id.toString() === id.toString())
      if (levelIndex !== -1) {
        this.accessLevels[levelIndex].name = name
        this.accessLevels[levelIndex].description = description
        localStorage.setItem("uptaxi_accessLevels", JSON.stringify(this.accessLevels))
        return true
      }
    }
    return false
  }

  async deleteAccessLevel(id) {
    try {
      const result = await apiClient.deleteAccessLevel(id)
      if (result.success) {
        await this.loadFromServer()
      }
    } catch (error) {
      console.error("Ошибка удаления уровня доступа:", error)
      // Fallback на localStorage
      this.accessLevels = this.accessLevels.filter((l) => l.id.toString() !== id.toString())
      localStorage.setItem("uptaxi_accessLevels", JSON.stringify(this.accessLevels))
    }
  }

  async loadContent(sectionId, subsectionId) {
    try {
      const content = await apiClient.getContent(sectionId, subsectionId)
      return content
    } catch (error) {
      console.error("Ошибка загрузки контента:", error)
      // Fallback на localStorage
      const key = `${sectionId}_${subsectionId}`
      return {
        content: this.content[key] || [],
        googleDocs: this.googleDocs.filter((doc) => doc.sectionId === sectionId && doc.subsectionId === subsectionId),
        files: this.files.filter((file) => file.sectionId === sectionId && file.subsectionId === subsectionId),
      }
    }
  }
}

// Глобальный экземпляр менеджера
let adminManager

// Глобальная переменная для хранения редактируемых подразделов
let editingSubsections = []

// Функции управления модальными окнами
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add("show")

    // Заполнить селекты разделов если нужно
    if (modalId === "addContentModal" || modalId === "addDocModal") {
      fillSectionSelects(modalId)
    }

    // Обновить селекты уровней доступа
    updateAccessLevelSelects()
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("show")
  }
}

// Обновление всех селектов уровней доступа
function updateAccessLevelSelects() {
  const selects = ["newUserAccess", "editUserAccess", "sectionAccess", "editSectionAccess"]

  selects.forEach((selectId) => {
    const select = document.getElementById(selectId)
    if (select && adminManager) {
      const currentValue = select.value
      select.innerHTML = ""

      // Сортировать уровни по ID для правильного порядка в селектах
      const sortedLevels = adminManager.accessLevels.sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id))

      sortedLevels.forEach((level) => {
        select.innerHTML += `<option value="${level.id}">Уровень ${level.id}: ${level.name}</option>`
      })

      if (currentValue) {
        select.value = currentValue
      }
    }
  })
}

// Заполнение селектов разделов
function fillSectionSelects(modalId) {
  const sectionSelect = document.getElementById(modalId === "addContentModal" ? "contentSection" : "docSection")
  const subsectionSelect = document.getElementById(
    modalId === "addContentModal" ? "contentSubsection" : "docSubsection",
  )

  if (sectionSelect && subsectionSelect && adminManager) {
    sectionSelect.innerHTML = '<option value="">Выберите раздел</option>'
    adminManager.sections.forEach((section) => {
      sectionSelect.innerHTML += `<option value="${section.id}">${section.name}</option>`
    })

    sectionSelect.onchange = function () {
      const selectedSectionId = this.value
      const selectedSection = adminManager.sections.find((s) => s.id === selectedSectionId)

      subsectionSelect.innerHTML = '<option value="">Выберите подраздел</option>'
      if (selectedSection) {
        selectedSection.subsections.forEach((subsection) => {
          subsectionSelect.innerHTML += `<option value="${subsection.id}">${subsection.name}</option>`
        })
      }
    }

    // Очистить подразделы при загрузке
    subsectionSelect.innerHTML = '<option value="">Сначала выберите раздел</option>'
  }
}

// Функции переключения разделов админки
function showAdminSection(sectionName) {
  // Убрать активный класс со всех пунктов меню
  document.querySelectorAll(".admin-nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Скрыть все разделы
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.classList.remove("active")
  })

  // Показать выбранный раздел
  const targetSection = document.getElementById(sectionName + "-section")
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Активировать пункт меню
  const menuItems = document.querySelectorAll(".admin-nav-item a")
  menuItems.forEach((item) => {
    if (item.onclick && item.onclick.toString().includes(sectionName)) {
      item.parentElement.classList.add("active")
    }
  })

  // Загрузить данные для раздела
  loadSectionData(sectionName)
}

// Загрузка данных для разделов
async function loadSectionData(sectionName) {
  if (!adminManager) return

  switch (sectionName) {
    case "dashboard":
      await loadDashboardStats()
      break
    case "users":
      await loadUsers()
      break
    case "sections":
      await loadSections()
      break
    case "access":
      await loadAccessLevels()
      break
    case "content":
      await loadContent()
      break
    case "files":
      await loadFiles()
      break
    case "docs":
      await loadDocs()
      break
    case "activities":
      await loadActivities()
      break
    case "subsections":
      await loadSubsections()
      break
  }
}

// Загрузка статистики дашборда
async function loadDashboardStats() {
  if (!adminManager) return

  document.getElementById("totalUsers").textContent = adminManager.users.length
  document.getElementById("totalSections").textContent = adminManager.sections.length

  let totalContent = 0
  Object.values(adminManager.content).forEach((sectionContent) => {
    totalContent += sectionContent.length
  })
  document.getElementById("totalContent").textContent = totalContent
  document.getElementById("totalDocs").textContent = adminManager.googleDocs.length

  console.log("Статистика дашборда обновлена:", {
    users: adminManager.users.length,
    sections: adminManager.sections.length,
    content: totalContent,
    docs: adminManager.googleDocs.length,
  })
}

// Загрузка пользователей
async function loadUsers() {
  const grid = document.getElementById("users-grid")
  if (!grid || !adminManager) return

  let html = ""
  adminManager.users.forEach((user) => {
    const accessLevelName = getAccessLevelName(user.accessLevel || 1)
    html += `
            <div class="data-card">
                <h4>${user.username}</h4>
                <p>Роль: ${user.role === "admin" ? "Администратор" : "Пользователь"}</p>
                <p>Уровень доступа: ${accessLevelName}</p>
                <div class="data-card-actions">
                    <button class="btn-edit" onclick="editUser('${user.username}')">Редактировать</button>
                    <button class="btn-danger" onclick="deleteUser('${user.username}')">Удалить</button>
                </div>
            </div>
        `
  })
  grid.innerHTML = html
}

// Загрузка разделов
async function loadSections() {
  const grid = document.getElementById("sections-grid")
  if (!grid || !adminManager) return

  let html = ""
  adminManager.sections.forEach((section) => {
    html += `
            <div class="data-card">
                <h4>${section.icon} ${section.name}</h4>
                <p>Подразделов: ${section.subsections ? section.subsections.length : 0}</p>
                <p>Доступ: ${getAccessLevelName(section.accessLevel)}</p>
                <div class="data-card-actions">
                    <button class="btn-edit" onclick="editSection('${section.id}')">Редактировать</button>
                    <button class="btn-danger" onclick="deleteSection('${section.id}')">Удалить</button>
                </div>
            </div>
        `
  })
  grid.innerHTML = html
}

// Загрузка уровней доступа
async function loadAccessLevels() {
  const grid = document.getElementById("access-grid")
  if (!grid || !adminManager) return

  let html = ""
  adminManager.accessLevels.forEach((level) => {
    html += `
            <div class="data-card">
                <h4>${level.name}</h4>
                <p>${level.description}</p>
                <div class="data-card-actions">
                    <button class="btn-edit" onclick="editAccessLevel('${level.id}')">Редактировать</button>
                    <button class="btn-danger" onclick="deleteAccessLevel('${level.id}')">Удалить</button>
                </div>
            </div>
        `
  })
  grid.innerHTML = html
}

// Загрузка контента
async function loadContent() {
  const grid = document.getElementById("content-grid")
  if (!grid || !adminManager) return

  console.log("Загрузка контента в админке...")

  let html = ""

  // Загрузить контент для всех разделов и подразделов
  for (const section of adminManager.sections) {
    for (const subsection of section.subsections) {
      try {
        const contentData = await adminManager.loadContent(section.id, subsection.id)

        if (contentData.content && contentData.content.length > 0) {
          contentData.content.forEach((item) => {
            const isLongContent = item.description.length > 200
            const contentId = `admin-content-${item.id}`
            const savedWidth = localStorage.getItem(`content-width-${item.id}`) || ""
            const widthStyle = savedWidth ? `style="width: ${savedWidth}px;"` : ""

            html += `
                      <div class="data-card admin-resizable" ${widthStyle} data-content-id="${item.id}">
                          <h4>${item.title}</h4>
                          <p><small><strong>Раздел:</strong> ${section.name} - ${subsection.name}</small></p>
                          <div class="content-text ${isLongContent ? "collapsed" : ""}" id="${contentId}">
                              ${item.description.replace(/\n/g, "<br>")}
                          </div>
                          ${
                            isLongContent
                              ? `
                              <button class="expand-btn" onclick="toggleAdminContent('${contentId}', this)">
                                  Читать далее
                              </button>
                          `
                              : ""
                          }
                          <p><small>Создано: ${item.createdAt}</small></p>
                          <div class="data-card-actions">
                              <button class="btn-edit" onclick="editContent('${section.id}_${subsection.id}', ${item.id})">Редактировать</button>
                              <button class="btn-danger" onclick="deleteContent('${section.id}_${subsection.id}', ${item.id})">Удалить</button>
                          </div>
                      </div>
                  `
          })
        }
      } catch (error) {
        console.error(`Ошибка загрузки контента для ${section.id}_${subsection.id}:`, error)
      }
    }
  }

  if (html === "") {
    html =
      '<div class="empty-state"><p>Контент не найден. Добавьте контент через форму выше или в разделах меню.</p></div>'
  }

  grid.innerHTML = html
  setupAdminResizeHandlers()
}

// Функция настройки обработчиков изменения размера в админке
function setupAdminResizeHandlers() {
  const resizableCards = document.querySelectorAll(".data-card.admin-resizable")

  resizableCards.forEach((card) => {
    const contentId = card.getAttribute("data-content-id")
    if (!contentId) return

    // Установить начальную ширину из localStorage
    const savedWidth = localStorage.getItem(`content-width-${contentId}`)
    if (savedWidth && savedWidth !== "null") {
      card.style.width = savedWidth + "px"
    }

    // Создать ResizeObserver для отслеживания изменений размера
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        if (width > 300) {
          localStorage.setItem(`content-width-${contentId}`, width)
          console.log(`Сохранена ширина ${width}px для контента ${contentId}`)

          const grid = card.closest(".data-grid")
          if (grid) {
            grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, max-content))"
          }
        }
      }
    })

    resizeObserver.observe(card)
    card._resizeObserver = resizeObserver
  })
}

// Загрузка файлов
async function loadFiles() {
  const grid = document.getElementById("files-grid")
  if (!grid || !adminManager) return

  let html = ""
  adminManager.files.forEach((file) => {
    html += `
            <div class="data-card">
                <h4>${file.name}</h4>
                <p>Тип: ${file.type}</p>
                <p><small>Загружено: ${file.createdAt}</small></p>
                <div class="data-card-actions">
                    <a href="${file.url}" target="_blank" class="btn-edit">Открыть</a>
                    <button class="btn-danger" onclick="deleteFile(${file.id})">Удалить</button>
                </div>
            </div>
        `
  })

  if (html === "") {
    html = "<p>Файлы не найдены</p>"
  }

  grid.innerHTML = html
}

// Загрузка документов
async function loadDocs() {
  const grid = document.getElementById("docs-grid")
  if (!grid || !adminManager) return

  let html = ""
  adminManager.googleDocs.forEach((doc) => {
    html += `
            <div class="data-card">
                <h4>${doc.title}</h4>
                <p><small>Создано: ${doc.createdAt}</small></p>
                <div class="data-card-actions">
                    <a href="${doc.url}" target="_blank" class="btn-edit">Открыть</a>
                    <button class="btn-danger" onclick="deleteDoc(${doc.id})">Удалить</button>
                </div>
            </div>
        `
  })

  if (html === "") {
    html = "<p>Документы не найдены</p>"
  }

  grid.innerHTML = html
}

// Загрузка активностей
async function loadActivities() {
  const grid = document.getElementById("activities-grid")
  if (!grid || !adminManager) return

  let html = ""
  adminManager.activities.forEach((activity) => {
    html += `
            <div class="data-card">
                <h4>${activity.icon} ${activity.title}</h4>
                <p><small>${activity.date}</small></p>
                <div class="data-card-actions">
                    <button class="btn-danger" onclick="deleteActivity(${activity.id})">Удалить</button>
                </div>
            </div>
        `
  })

  if (html === "") {
    html = "<p>Активности не найдены</p>"
  }

  grid.innerHTML = html
}

// Глобальная переменная для хранения текущего URL документа
let currentGoogleDocUrl = ""

// Функция открытия Google документа во встроенном просмотрщике
function openGoogleDocEmbed(url, title) {
  let embedUrl = url

  if (url.includes("docs.google.com/document/d/")) {
    const docId = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
    if (docId) {
      embedUrl = `https://docs.google.com/document/d/${docId[1]}/preview`
    }
  } else if (url.includes("docs.google.com/spreadsheets/d/")) {
    const docId = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (docId) {
      embedUrl = `https://docs.google.com/spreadsheets/d/${docId[1]}/preview`
    }
  } else if (url.includes("docs.google.com/presentation/d/")) {
    const docId = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)
    if (docId) {
      embedUrl = `https://docs.google.com/presentation/d/${docId[1]}/preview`
    }
  }

  currentGoogleDocUrl = url
  document.getElementById("googleDocTitle").textContent = title
  document.getElementById("googleDocFrame").src = embedUrl
  openModal("googleDocModal")
}

function openGoogleDocInNewTab() {
  if (currentGoogleDocUrl) {
    window.open(currentGoogleDocUrl, "_blank")
  }
}

// Загрузка подразделов
async function loadSubsections() {
  const grid = document.getElementById("subsections-grid")
  const filter = document.getElementById("sectionFilter")

  if (!grid || !filter || !adminManager) return

  filter.innerHTML = '<option value="">Все разделы</option>'
  adminManager.sections.forEach((section) => {
    filter.innerHTML += `<option value="${section.id}">${section.name}</option>`
  })

  filterSubsectionContent()
}

async function filterSubsectionContent() {
  const grid = document.getElementById("subsections-grid")
  const filter = document.getElementById("sectionFilter")

  if (!grid || !filter || !adminManager) return

  const selectedSectionId = filter.value
  let html = ""

  for (const section of adminManager.sections) {
    if (!selectedSectionId || section.id === selectedSectionId) {
      for (const subsection of section.subsections) {
        try {
          const contentData = await adminManager.loadContent(section.id, subsection.id)
          const totalItems =
            (contentData.content?.length || 0) +
            (contentData.googleDocs?.length || 0) +
            (contentData.files?.length || 0)

          html += `
                      <div class="data-card">
                          <h4>${section.icon} ${section.name} - ${subsection.name}</h4>
                          <p>Контента: ${contentData.content?.length || 0}</p>
                          <p>Документов: ${contentData.googleDocs?.length || 0}</p>
                          <p>Файлов: ${contentData.files?.length || 0}</p>
                          <p>Всего элементов: ${totalItems}</p>
                          <div class="data-card-actions">
                              <button class="btn-edit" onclick="manageSubsectionContent('${section.id}', '${subsection.id}')">Управлять</button>
                          </div>
                      </div>
                  `
        } catch (error) {
          console.error(`Ошибка загрузки данных подраздела ${section.id}_${subsection.id}:`, error)
        }
      }
    }
  }

  if (html === "") {
    html = "<p>Подразделы не найдены</p>"
  }

  grid.innerHTML = html
}

function manageSubsectionContent(sectionId, subsectionId) {
  alert(`Управление контентом подраздела ${sectionId}_${subsectionId} будет добавлено в следующих версиях`)
}

// Вспомогательные функции
function getAccessLevelName(level) {
  if (!adminManager) return "Неизвестный"
  const accessLevel = adminManager.accessLevels.find((l) => l.id.toString() === level.toString())
  return accessLevel ? `Уровень ${accessLevel.id}: ${accessLevel.name}` : "Неизвестный"
}

// Функции редактирования
function editUser(username) {
  if (!adminManager) return
  const user = adminManager.users.find((u) => u.username === username)
  if (user) {
    document.getElementById("editUserOldUsername").value = username
    document.getElementById("editUsername").value = user.username
    document.getElementById("editPassword").value = user.password
    document.getElementById("editUserRole").value = user.role
    document.getElementById("editUserAccess").value = user.accessLevel || 1
    updateAccessLevelSelects()
    openModal("editUserModal")
  }
}

function editSection(sectionId) {
  if (!adminManager) return
  const section = adminManager.sections.find((s) => s.id === sectionId)
  if (section) {
    document.getElementById("editSectionId").value = sectionId
    document.getElementById("editSectionName").value = section.name
    document.getElementById("editSectionIcon").value = section.icon
    document.getElementById("editSectionAccess").value = section.accessLevel

    editingSubsections = JSON.parse(JSON.stringify(section.subsections))
    loadSubsectionsForEdit(editingSubsections)
    updateAccessLevelSelects()
    openModal("editSectionModal")
  }
}

function loadSubsectionsForEdit(subsections) {
  const container = document.getElementById("editSubsectionsList")
  if (!container || !adminManager) return

  let html = ""
  subsections.forEach((subsection, index) => {
    const sortedLevels = adminManager.accessLevels.sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id))

    let accessOptions = ""
    sortedLevels.forEach((level) => {
      const selected = subsection.accessLevel == level.id ? "selected" : ""
      accessOptions += `<option value="${level.id}" ${selected}>${level.name}</option>`
    })

    html += `
            <div class="subsection-edit-item" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <div class="form-group">
                    <label>Название подраздела ${index + 1}</label>
                    <input type="text" value="${subsection.name}" onchange="updateSubsectionName(${index}, this.value)">
                </div>
                <div class="form-group">
                    <label>Уровень доступа</label>
                    <select onchange="updateSubsectionAccess(${index}, this.value)">
                        ${accessOptions}
                    </select>
                </div>
                <button type="button" onclick="removeSubsection(${index})" class="btn-danger" style="margin-top: 10px;">Удалить подраздел</button>
            </div>
        `
  })
  container.innerHTML = html
}

function updateSubsectionName(index, name) {
  if (editingSubsections[index]) {
    editingSubsections[index].name = name
  }
}

function updateSubsectionAccess(index, accessLevel) {
  if (editingSubsections[index]) {
    editingSubsections[index].accessLevel = Number.parseInt(accessLevel)
  }
}

function addSubsectionToEdit() {
  const newSubsection = {
    id: "subsection" + Date.now(),
    name: "Новый подраздел",
    accessLevel: 1,
  }
  editingSubsections.push(newSubsection)
  loadSubsectionsForEdit(editingSubsections)
}

function removeSubsection(index) {
  if (confirm("Вы уверены, что хотите удалить этот подраздел?")) {
    editingSubsections.splice(index, 1)
    loadSubsectionsForEdit(editingSubsections)
  }
}

function editAccessLevel(id) {
  if (!adminManager) return
  const level = adminManager.accessLevels.find((l) => l.id.toString() === id.toString())
  if (level) {
    document.getElementById("editAccessId").value = id
    document.getElementById("editAccessName").value = level.name
    document.getElementById("editAccessDescription").value = level.description
    openModal("editAccessModal")
  } else {
    alert("Ошибка: уровень доступа не найден")
  }
}

// Функции удаления
async function deleteUser(username) {
  if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
    await adminManager.deleteUser(username)
    await loadUsers()
  }
}

async function deleteSection(sectionId) {
  if (confirm("Вы уверены, что хотите удалить этот раздел?")) {
    await adminManager.deleteSection(sectionId)
    await loadSections()
  }
}

async function deleteAccessLevel(id) {
  if (confirm("Вы уверены, что хотите удалить этот уровень доступа?")) {
    await adminManager.deleteAccessLevel(id.toString())
    await loadAccessLevels()
    updateAccessLevelSelects()
  }
}

async function deleteContent(key, id) {
  if (confirm("Вы уверены, что хотите удалить этот контент?")) {
    try {
      await apiClient.deleteContent(id)
      await loadContent()
    } catch (error) {
      console.error("Ошибка удаления контента:", error)
      // Fallback на localStorage
      adminManager.content[key] = adminManager.content[key].filter((item) => item.id !== id)
      localStorage.setItem("uptaxi_content", JSON.stringify(adminManager.content))
      await loadContent()
    }
  }
}

async function deleteFile(id) {
  if (confirm("Вы уверены, что хотите удалить этот файл?")) {
    try {
      await apiClient.deleteFile(id)
      await loadFiles()
    } catch (error) {
      console.error("Ошибка удаления файла:", error)
      adminManager.files = adminManager.files.filter((file) => file.id !== id)
      localStorage.setItem("uptaxi_files", JSON.stringify(adminManager.files))
      await loadFiles()
    }
  }
}

async function deleteDoc(id) {
  if (confirm("Вы уверены, что хотите удалить этот документ?")) {
    try {
      await apiClient.deleteGoogleDoc(id)
      await loadDocs()
    } catch (error) {
      console.error("Ошибка удаления документа:", error)
      adminManager.googleDocs = adminManager.googleDocs.filter((doc) => doc.id !== id)
      localStorage.setItem("uptaxi_googleDocs", JSON.stringify(adminManager.googleDocs))
      await loadDocs()
    }
  }
}

async function deleteActivity(id) {
  if (confirm("Вы уверены, что хотите удалить это обновление?")) {
    await adminManager.deleteActivity(id)
    await loadActivities()
  }
}

function editContent(key, id) {
  if (!adminManager.content[key]) return

  const item = adminManager.content[key].find((c) => c.id === id)
  if (!item) return

  document.getElementById("editContentKey").value = key
  document.getElementById("editContentId").value = id
  document.getElementById("editContentTitle").value = item.title
  document.getElementById("editContentDescription").value = item.description

  openModal("editContentModal")
}

async function updateContent(key, id, title, description) {
  try {
    const result = await apiClient.updateContent({
      id: id,
      title: title,
      description: description,
    })

    if (result.success) {
      return true
    }
  } catch (error) {
    console.error("Ошибка обновления контента:", error)
    // Fallback на localStorage
    if (!adminManager.content[key]) return false

    const itemIndex = adminManager.content[key].findIndex((item) => item.id === id)
    if (itemIndex === -1) return false

    adminManager.content[key][itemIndex].title = title
    adminManager.content[key][itemIndex].description = description
    localStorage.setItem("uptaxi_content", JSON.stringify(adminManager.content))
    return true
  }
  return false
}

function toggleAdminContent(contentId, button) {
  const contentElement = document.getElementById(contentId)
  const isCollapsed = contentElement.classList.contains("collapsed")

  if (isCollapsed) {
    contentElement.classList.remove("collapsed")
    button.textContent = "Свернуть"
  } else {
    contentElement.classList.add("collapsed")
    button.textContent = "Читать далее"
  }
}

async function uploadFiles() {
  const fileInput = document.getElementById("fileUpload")
  const files = fileInput.files

  if (files.length === 0) {
    alert("Выберите файлы для загрузки")
    return
  }

  try {
    for (const file of files) {
      await apiClient.uploadFile(file, "", "")
    }
    await loadFiles()
    fileInput.value = ""
    alert("Файлы успешно загружены")
  } catch (error) {
    console.error("Ошибка загрузки файлов:", error)
    // Fallback на localStorage
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      adminManager.files.push({
        id: Date.now(),
        name: file.name,
        url: url,
        sectionId: "",
        subsectionId: "",
        type: file.type,
        createdAt: new Date().toLocaleDateString(),
      })
    })
    localStorage.setItem("uptaxi_files", JSON.stringify(adminManager.files))
    await loadFiles()
    fileInput.value = ""
    alert("Файлы успешно загружены")
  }
}

// Обработчики форм
document.addEventListener("DOMContentLoaded", async () => {
  if (!checkAdminAuth()) return

  // Инициализировать менеджер админки
  adminManager = new AdminSectionManager()

  // Дождаться загрузки данных с сервера
  await adminManager.loadFromServer()

  const user = auth.currentUser
  document.getElementById("adminCurrentUser").textContent = user.username
  document.getElementById("adminUserInitials").textContent = user.username.charAt(0).toUpperCase()

  // Показать дашборд по умолчанию
  showAdminSection("dashboard")

  // Обработчик создания пользователя
  const createUserForm = document.getElementById("createUserForm")
  if (createUserForm) {
    createUserForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const username = document.getElementById("newUsername").value
      const password = document.getElementById("newPassword").value
      const role = document.getElementById("newUserRole").value
      const accessLevel = document.getElementById("newUserAccess").value

      if (adminManager.users.find((u) => u.username === username)) {
        alert("Пользователь с таким именем уже существует")
        return
      }

      await adminManager.createUser(username, password, role, accessLevel)
      closeModal("createUserModal")
      await loadUsers()
      createUserForm.reset()
    })
  }

  // Обработчик создания раздела
  const createSectionForm = document.getElementById("createSectionForm")
  if (createSectionForm) {
    createSectionForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const name = document.getElementById("sectionName").value
      const icon = document.getElementById("sectionIcon").value
      const accessLevel = document.getElementById("sectionAccess").value

      await adminManager.createSection(name, icon, accessLevel)
      closeModal("createSectionModal")
      await loadSections()
      createSectionForm.reset()
    })
  }

  // Обработчик создания уровня доступа
  const createAccessForm = document.getElementById("createAccessForm")
  if (createAccessForm) {
    createAccessForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const name = document.getElementById("accessName").value
      const description = document.getElementById("accessDescription").value

      const newLevel = await adminManager.createAccessLevel(name, description)
      if (newLevel) {
        closeModal("createAccessModal")
        await loadAccessLevels()
        updateAccessLevelSelects()
        createAccessForm.reset()
        alert(`Создан уровень ${newLevel.id}: ${newLevel.name}`)
      }
    })
  }

  // Обработчик редактирования пользователя
  const editUserForm = document.getElementById("editUserForm")
  if (editUserForm) {
    editUserForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const oldUsername = document.getElementById("editUserOldUsername").value
      const newUsername = document.getElementById("editUsername").value
      const newPassword = document.getElementById("editPassword").value
      const newRole = document.getElementById("editUserRole").value
      const newAccessLevel = document.getElementById("editUserAccess").value

      await adminManager.updateUser(oldUsername, newUsername, newPassword, newRole, newAccessLevel)
      closeModal("editUserModal")
      await loadUsers()
    })
  }

  // Обработчик редактирования раздела
  const editSectionForm = document.getElementById("editSectionForm")
  if (editSectionForm) {
    editSectionForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const sectionId = document.getElementById("editSectionId").value
      const name = document.getElementById("editSectionName").value
      const icon = document.getElementById("editSectionIcon").value
      const accessLevel = document.getElementById("editSectionAccess").value

      await adminManager.updateSection(sectionId, name, icon, accessLevel, editingSubsections)
      closeModal("editSectionModal")
      await loadSections()
    })
  }

  // Обработчик редактирования уровня доступа
  const editAccessForm = document.getElementById("editAccessForm")
  if (editAccessForm) {
    editAccessForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const id = document.getElementById("editAccessId").value
      const name = document.getElementById("editAccessName").value
      const description = document.getElementById("editAccessDescription").value

      if (await adminManager.updateAccessLevel(id, name, description)) {
        alert("Уровень доступа успешно обновлен")
      } else {
        alert("Ошибка при обновлении уровня доступа")
      }
      closeModal("editAccessModal")
      await loadAccessLevels()
      updateAccessLevelSelects()
    })
  }

  // Обработчик добавления контента
  const addContentForm = document.getElementById("addContentForm")
  if (addContentForm) {
    addContentForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const section = document.getElementById("contentSection").value
      const subsection = document.getElementById("contentSubsection").value
      const title = document.getElementById("contentTitle").value
      const description = document.getElementById("contentDescription").value

      if (!section || !subsection) {
        alert("Выберите раздел и подраздел")
        return
      }

      if (!title.trim() || !description.trim()) {
        alert("Заполните все поля")
        return
      }

      await adminManager.addContent(section, subsection, title, description)
      await adminManager.addActivity(`Добавлен контент: ${title}`, "📝")

      closeModal("addContentModal")
      await loadContent()
      await loadDashboardStats()
      addContentForm.reset()

      document.getElementById("contentSection").innerHTML = '<option value="">Выберите раздел</option>'
      document.getElementById("contentSubsection").innerHTML = '<option value="">Сначала выберите раздел</option>'

      alert("Контент успешно добавлен!")
    })
  }

  // Обработчик добавления документа
  const addDocForm = document.getElementById("addDocForm")
  if (addDocForm) {
    addDocForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const title = document.getElementById("docTitle").value
      const url = document.getElementById("docUrl").value
      const sectionId = document.getElementById("docSection").value
      const subsectionId = document.getElementById("docSubsection").value

      if (!sectionId || !subsectionId) {
        alert("Выберите раздел и подраздел")
        return
      }

      if (!title.trim() || !url.trim()) {
        alert("Заполните все поля")
        return
      }

      await adminManager.addGoogleDoc(title, url, sectionId, subsectionId)
      await adminManager.addActivity(`Добавлен документ: ${title}`, "📄")

      closeModal("addDocModal")
      await loadDocs()
      await loadDashboardStats()
      addDocForm.reset()

      document.getElementById("docSection").innerHTML = '<option value="">Выберите раздел</option>'
      document.getElementById("docSubsection").innerHTML = '<option value="">Сначала выберите раздел</option>'

      alert("Документ успешно добавлен!")
    })
  }

  // Обработчик добавления активности
  const addActivityForm = document.getElementById("addActivityForm")
  if (addActivityForm) {
    addActivityForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const title = document.getElementById("activityTitle").value
      const icon = document.getElementById("activityIcon").value

      await adminManager.addActivity(title, icon)
      closeModal("addActivityModal")
      await loadActivities()
      addActivityForm.reset()
    })
  }

  // Обработчик редактирования контента
  const editContentForm = document.getElementById("editContentForm")
  if (editContentForm) {
    editContentForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const key = document.getElementById("editContentKey").value
      const id = Number.parseInt(document.getElementById("editContentId").value)
      const title = document.getElementById("editContentTitle").value
      const description = document.getElementById("editContentDescription").value

      if (await updateContent(key, id, title, description)) {
        alert("Контент успешно обновлен")
        closeModal("editContentModal")
        await loadContent()
      } else {
        alert("Ошибка при обновлении контента")
      }
    })
  }
})
