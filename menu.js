// Система управления меню пользователя
const apiClient = {
  getSections: async () => {
    // Пример реализации
    return [
      {
        id: 1,
        name: "Раздел 1",
        icon: "🏠",
        accessLevel: 1,
        subsections: [{ id: 11, name: "Подраздел 1.1", accessLevel: 1 }],
      },
      {
        id: 2,
        name: "Раздел 2",
        icon: "🔧",
        accessLevel: 2,
        subsections: [{ id: 21, name: "Подраздел 2.1", accessLevel: 2 }],
      },
    ]
  },
  getActivities: async () => {
    // Пример реализации
    return [
      { id: 1, title: "Активность 1", icon: "📅", date: "2023-10-01" },
      { id: 2, title: "Активность 2", icon: "📅", date: "2023-09-30" },
    ]
  },
  getContent: async (sectionId, subsectionId) => {
    // Пример реализации
    return {
      content: [{ id: 1, title: "Контент 1", description: "Описание контента 1", createdAt: "2023-10-01" }],
      googleDocs: [
        {
          id: 1,
          url: "https://docs.google.com/document/d/1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7",
          title: "Документ 1",
          sectionId: sectionId,
          subsectionId: subsectionId,
          createdAt: "2023-10-01",
        },
      ],
      files: [
        {
          id: 1,
          url: "https://example.com/file.pdf",
          name: "Файл 1",
          type: "application/pdf",
          size: 1024,
          sectionId: sectionId,
          subsectionId: subsectionId,
          createdAt: "2023-10-01",
        },
      ],
    }
  },
}

const auth = {
  isLoggedIn: () => true,
  getCurrentUser: () => ({ username: "JohnDoe", role: "user", accessLevel: 1 }),
}

class MenuManager {
  constructor() {
    this.sections = []
    this.content = {}
    this.googleDocs = []
    this.files = []
    this.activities = []
    this.currentUser = null

    // Загрузить данные
    this.loadData()
  }

  async loadData() {
    try {
      // Загрузить разделы с сервера
      this.sections = await apiClient.getSections()

      // Загрузить активности
      this.activities = await apiClient.getActivities()

      console.log("Данные меню загружены с сервера:", {
        sections: this.sections.length,
        activities: this.activities.length,
      })

      // Обновить интерфейс
      this.renderMenu()
      this.renderActivities()
      this.loadAllContent()
    } catch (error) {
      console.error("Ошибка загрузки данных меню:", error)
      // Fallback на localStorage
      this.loadFromLocalStorage()
    }
  }

  loadFromLocalStorage() {
    this.sections = JSON.parse(localStorage.getItem("uptaxi_sections")) || []
    this.content = JSON.parse(localStorage.getItem("uptaxi_content")) || {}
    this.googleDocs = JSON.parse(localStorage.getItem("uptaxi_googleDocs")) || []
    this.files = JSON.parse(localStorage.getItem("uptaxi_files")) || []
    this.activities = JSON.parse(localStorage.getItem("uptaxi_activities")) || []

    this.renderMenu()
    this.renderActivities()
    this.loadAllContent()
  }

  renderMenu() {
    const menuNav = document.getElementById("menuNav")
    if (!menuNav) return

    let html = ""

    // Фильтровать разделы по уровню доступа пользователя
    const userAccessLevel = this.currentUser ? this.currentUser.accessLevel : 1
    const isAdmin = this.currentUser && this.currentUser.role === "admin"

    const accessibleSections = this.sections.filter((section) => {
      return isAdmin || section.accessLevel <= userAccessLevel
    })

    if (accessibleSections.length === 0) {
      html =
        '<div class="menu-section"><p style="padding: 20px; text-align: center; color: rgba(255,255,255,0.7);">Нет доступных разделов</p></div>'
    } else {
      accessibleSections.forEach((section) => {
        // Фильтровать подразделы по уровню доступа
        const accessibleSubsections = section.subsections.filter((subsection) => {
          return isAdmin || subsection.accessLevel <= userAccessLevel
        })

        if (accessibleSubsections.length > 0) {
          html += `
            <div class="menu-section">
              <div class="menu-item" onclick="toggleSubmenu('${section.id}')">
                <a href="#">
                  <i class="menu-icon">${section.icon}</i>
                  ${section.name}
                  <i class="fas fa-chevron-down" style="margin-left: auto; transition: transform 0.3s;"></i>
                </a>
              </div>
              <div class="submenu" id="submenu-${section.id}">
          `

          accessibleSubsections.forEach((subsection) => {
            html += `
              <div class="submenu-item" onclick="showContent('${section.id}', '${subsection.id}', '${section.name}', '${subsection.name}')">
                <a href="#">${subsection.name}</a>
              </div>
            `
          })

          html += `
              </div>
            </div>
          `
        }
      })
    }

    menuNav.innerHTML = html
  }

  renderActivities() {
    const activitiesList = document.getElementById("activitiesList")
    if (!activitiesList) return

    if (this.activities.length === 0) {
      activitiesList.innerHTML = '<p style="text-align: center; color: #64748b;">Нет активностей</p>'
      return
    }

    let html = ""
    // Показать последние 5 активностей
    const recentActivities = this.activities.slice(-5).reverse()

    recentActivities.forEach((activity) => {
      html += `
        <div class="activity-item">
          <div class="activity-icon">${activity.icon}</div>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-date">${activity.date}</div>
          </div>
        </div>
      `
    })

    activitiesList.innerHTML = html
  }

  async loadAllContent() {
    const contentSections = document.getElementById("contentSections")
    if (!contentSections) return

    let html = ""

    // Создать разделы для каждой комбинации раздел-подраздел
    for (const section of this.sections) {
      for (const subsection of section.subsections) {
        // Проверить доступ
        const userAccessLevel = this.currentUser ? this.currentUser.accessLevel : 1
        const isAdmin = this.currentUser && this.currentUser.role === "admin"

        if (!isAdmin && (section.accessLevel > userAccessLevel || subsection.accessLevel > userAccessLevel)) {
          continue
        }

        const sectionId = `${section.id}_${subsection.id}`

        html += `
          <div id="content-${sectionId}" class="content-section">
            <div class="page-header">
              <h2 class="page-title">${section.icon} ${section.name} - ${subsection.name}</h2>
              <p class="page-subtitle">Контент раздела ${subsection.name}</p>
            </div>
            <div class="content-grid" id="grid-${sectionId}">
              <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
                Загрузка контента...
              </div>
            </div>
          </div>
        `
      }
    }

    contentSections.innerHTML = html

    // Загрузить контент для каждого раздела
    for (const section of this.sections) {
      for (const subsection of section.subsections) {
        const userAccessLevel = this.currentUser ? this.currentUser.accessLevel : 1
        const isAdmin = this.currentUser && this.currentUser.role === "admin"

        if (!isAdmin && (section.accessLevel > userAccessLevel || subsection.accessLevel > userAccessLevel)) {
          continue
        }

        await this.loadSectionContent(section.id, subsection.id, section.name, subsection.name)
      }
    }
  }

  async loadSectionContent(sectionId, subsectionId, sectionName, subsectionName) {
    const gridId = `grid-${sectionId}_${subsectionId}`
    const grid = document.getElementById(gridId)
    if (!grid) return

    try {
      // Загрузить контент с сервера
      const contentData = await apiClient.getContent(sectionId, subsectionId)

      let html = ""
      let hasContent = false

      // Текстовый контент
      if (contentData.content && contentData.content.length > 0) {
        contentData.content.forEach((item) => {
          hasContent = true
          const isLongContent = item.description.length > 300
          const contentId = `content-${item.id}`
          const savedWidth = localStorage.getItem(`content-width-${item.id}`) || ""
          const widthStyle = savedWidth ? `style="width: ${savedWidth}px;"` : ""

          html += `
            <div class="content-card resizable" ${widthStyle} data-content-id="${item.id}">
              <h3>${item.title}</h3>
              <div class="content-text ${isLongContent ? "collapsed" : ""}" id="${contentId}">
                ${item.description.replace(/\n/g, "<br>")}
              </div>
              ${
                isLongContent
                  ? `
                <button class="expand-btn" onclick="toggleContent('${contentId}', this)">
                  Читать далее
                </button>
              `
                  : ""
              }
              <div class="content-meta">
                <span class="content-date">Создано: ${item.createdAt}</span>
              </div>
            </div>
          `
        })
      }

      // Google документы
      if (contentData.googleDocs && contentData.googleDocs.length > 0) {
        contentData.googleDocs.forEach((doc) => {
          hasContent = true
          html += `
            <div class="content-card" onclick="openGoogleDocEmbed('${doc.url}', '${doc.title}')">
              <div class="doc-icon">📄</div>
              <h3>${doc.title}</h3>
              <p>Google документ</p>
              <div class="content-meta">
                <span class="content-date">Создано: ${doc.createdAt}</span>
                <div class="content-actions">
                  <span class="btn-link">Открыть</span>
                </div>
              </div>
            </div>
          `
        })
      }

      // Файлы
      if (contentData.files && contentData.files.length > 0) {
        contentData.files.forEach((file) => {
          hasContent = true
          const fileIcon = this.getFileIcon(file.type)
          html += `
            <div class="content-card">
              <div class="file-icon">${fileIcon}</div>
              <h3 class="file-name">${file.name}</h3>
              <p class="file-size">${this.formatFileSize(file.size)}</p>
              <div class="content-meta">
                <span class="content-date">Загружено: ${file.createdAt}</span>
                <div class="content-actions">
                  <a href="${file.url}" target="_blank" class="btn-link">Скачать</a>
                </div>
              </div>
            </div>
          `
        })
      }

      if (!hasContent) {
        html = `
          <div class="empty-content">
            <h3>Контент не найден</h3>
            <p>В этом разделе пока нет контента</p>
          </div>
        `
      }

      grid.innerHTML = html

      // Настроить обработчики изменения размера
      this.setupResizeHandlers()
    } catch (error) {
      console.error(`Ошибка загрузки контента для ${sectionId}_${subsectionId}:`, error)

      // Fallback на localStorage
      const key = `${sectionId}_${subsectionId}`
      const localContent = this.content[key] || []
      const localDocs = this.googleDocs.filter(
        (doc) => doc.sectionId === sectionId && doc.subsectionId === subsectionId,
      )
      const localFiles = this.files.filter((file) => file.sectionId === sectionId && file.subsectionId === subsectionId)

      let html = ""
      let hasContent = false

      // Локальный контент
      localContent.forEach((item) => {
        hasContent = true
        const isLongContent = item.description.length > 300
        const contentId = `content-${item.id}`

        html += `
          <div class="content-card">
            <h3>${item.title}</h3>
            <div class="content-text ${isLongContent ? "collapsed" : ""}" id="${contentId}">
              ${item.description.replace(/\n/g, "<br>")}
            </div>
            ${
              isLongContent
                ? `
              <button class="expand-btn" onclick="toggleContent('${contentId}', this)">
                Читать далее
              </button>
            `
                : ""
            }
            <div class="content-meta">
              <span class="content-date">Создано: ${item.createdAt}</span>
            </div>
          </div>
        `
      })

      // Локальные документы
      localDocs.forEach((doc) => {
        hasContent = true
        html += `
          <div class="content-card" onclick="openGoogleDocEmbed('${doc.url}', '${doc.title}')">
            <div class="doc-icon">📄</div>
            <h3>${doc.title}</h3>
            <p>Google документ</p>
            <div class="content-meta">
              <span class="content-date">Создано: ${doc.createdAt}</span>
              <div class="content-actions">
                <span class="btn-link">Открыть</span>
              </div>
            </div>
          </div>
        `
      })

      // Локальные файлы
      localFiles.forEach((file) => {
        hasContent = true
        const fileIcon = this.getFileIcon(file.type)
        html += `
          <div class="content-card">
            <div class="file-icon">${fileIcon}</div>
            <h3 class="file-name">${file.name}</h3>
            <div class="content-meta">
              <span class="content-date">Загружено: ${file.createdAt}</span>
              <div class="content-actions">
                <a href="${file.url}" target="_blank" class="btn-link">Скачать</a>
              </div>
            </div>
          </div>
        `
      })

      if (!hasContent) {
        html = `
          <div class="empty-content">
            <h3>Контент не найден</h3>
            <p>В этом разделе пока нет контента</p>
          </div>
        `
      }

      grid.innerHTML = html
      this.setupResizeHandlers()
    }
  }

  setupResizeHandlers() {
    const resizableCards = document.querySelectorAll(".content-card.resizable")

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
          if (width > 350) {
            localStorage.setItem(`content-width-${contentId}`, width)
            console.log(`Сохранена ширина ${width}px для контента ${contentId}`)
          }
        }
      })

      resizeObserver.observe(card)
      card._resizeObserver = resizeObserver
    })
  }

  getFileIcon(fileType) {
    if (!fileType) return "📄"

    if (fileType.includes("image")) return "🖼️"
    if (fileType.includes("video")) return "🎥"
    if (fileType.includes("audio")) return "🎵"
    if (fileType.includes("pdf")) return "📕"
    if (fileType.includes("word") || fileType.includes("document")) return "📝"
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊"
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "📈"
    if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️"

    return "📄"
  }

  formatFileSize(bytes) {
    if (!bytes) return "Неизвестно"

    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }
}

// Глобальный менеджер меню
let menuManager

// Глобальная переменная для хранения текущего URL документа
let currentGoogleDocUrl = ""

// Функции управления меню
function toggleSubmenu(sectionId) {
  const submenu = document.getElementById(`submenu-${sectionId}`)
  const chevron = submenu.previousElementSibling.querySelector(".fa-chevron-down")

  if (submenu.classList.contains("open")) {
    submenu.classList.remove("open")
    chevron.style.transform = "rotate(0deg)"
  } else {
    // Закрыть все другие подменю
    document.querySelectorAll(".submenu.open").forEach((menu) => {
      menu.classList.remove("open")
      const otherChevron = menu.previousElementSibling.querySelector(".fa-chevron-down")
      if (otherChevron) otherChevron.style.transform = "rotate(0deg)"
    })

    submenu.classList.add("open")
    chevron.style.transform = "rotate(180deg)"
  }
}

function showContent(sectionId, subsectionId, sectionName, subsectionName) {
  // Скрыть все разделы контента
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })

  // Убрать активный класс со всех пунктов меню
  document.querySelectorAll(".submenu-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Показать выбранный раздел
  const targetSection = document.getElementById(`content-${sectionId}_${subsectionId}`)
  if (targetSection) {
    targetSection.classList.add("active")
  }

  // Активировать пункт меню
  event.target.closest(".submenu-item").classList.add("active")
}

function toggleContent(contentId, button) {
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

function openGoogleDocEmbed(url, title) {
  // Преобразовать URL для встраивания
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

function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add("show")
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("show")
  }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
  // Проверить авторизацию
  if (!auth.isLoggedIn()) {
    window.location.href = "index.html"
    return
  }

  // Инициализировать менеджер меню
  menuManager = new MenuManager()
  menuManager.currentUser = auth.getCurrentUser()

  // Обновить информацию о пользователе
  const user = auth.getCurrentUser()
  document.getElementById("currentUser").textContent = user.username
  document.getElementById("userInitials").textContent = user.username.charAt(0).toUpperCase()
  document.getElementById("userRole").textContent = user.role === "admin" ? "Администратор" : "Пользователь"

  // Слушать обновления разделов
  window.addEventListener("sectionsUpdated", () => {
    menuManager.loadData()
  })
})
