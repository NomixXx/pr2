// Updated menu system for server-side
const apiClient = {} // Declare apiClient variable
const auth = {} // Declare auth variable
const checkAuth = () => true // Declare checkAuth function
const loadDynamicSections = () => {} // Declare loadDynamicSections function
const updateRecentActivity = () => {} // Declare updateRecentActivity function
const switchToContent = () => {} // Declare switchToContent function
const setupResizeHandlers = () => {} // Declare setupResizeHandlers function
const closeModal = (modalId) => {} // Declare closeModal function

class SectionManager {
  constructor() {
    this.sections = []
  }

  async loadSections() {
    try {
      this.sections = await apiClient.getSections()
    } catch (error) {
      console.error("Failed to load sections:", error)
      this.sections = []
    }
  }

  getSections() {
    return this.sections
  }

  getSectionsForUser(userAccessLevel) {
    return this.sections.filter((section) => section.access_level <= userAccessLevel)
  }
}

class ContentManager {
  constructor() {
    this.activities = []
  }

  async loadActivities() {
    try {
      this.activities = await apiClient.getActivities()
    } catch (error) {
      console.error("Failed to load activities:", error)
      this.activities = []
    }
  }

  async addContent(sectionId, subsectionId, title, description) {
    try {
      await apiClient.createContent({
        sectionId,
        subsectionId,
        title,
        description,
      })
      await this.addActivity(`Добавлена информация: ${title}`, "📝")
    } catch (error) {
      console.error("Failed to add content:", error)
      throw error
    }
  }

  async addGoogleDoc(title, url, sectionId, subsectionId) {
    try {
      await apiClient.createGoogleDoc({
        title,
        url,
        sectionId,
        subsectionId,
      })
      await this.addActivity(`Добавлен документ: ${title}`, "📄")
    } catch (error) {
      console.error("Failed to add Google doc:", error)
      throw error
    }
  }

  async addFile(file, sectionId, subsectionId) {
    try {
      await apiClient.uploadFile(file, sectionId, subsectionId)
      await this.addActivity(`Загружен файл: ${file.name}`, "📁")
    } catch (error) {
      console.error("Failed to upload file:", error)
      throw error
    }
  }

  async addActivity(title, icon) {
    try {
      await apiClient.createActivity({ title, icon })
      await this.loadActivities()
    } catch (error) {
      console.error("Failed to add activity:", error)
    }
  }

  getActivities() {
    return this.activities.slice(-5).reverse()
  }

  async getContent(sectionId, subsectionId) {
    try {
      const response = await apiClient.getContent(sectionId, subsectionId)
      return {
        content: response.content || [],
        googleDocs: response.googleDocs || [],
        files: response.files || [],
      }
    } catch (error) {
      console.error("Failed to get content:", error)
      return { content: [], googleDocs: [], files: [] }
    }
  }
}

// Global instances
const sectionManager = new SectionManager()
const contentManager = new ContentManager()

// Updated initialization
document.addEventListener("DOMContentLoaded", async () => {
  if (checkAuth()) {
    const user = auth.currentUser

    // Load data from server
    await sectionManager.loadSections()
    await contentManager.loadActivities()

    // Load dynamic sections
    loadDynamicSections()

    document.getElementById("currentUser").textContent = user.username
    document.getElementById("userInitials").textContent = user.username.charAt(0).toUpperCase()

    // Show admin panel for administrators
    if (auth.isAdmin()) {
      document.querySelectorAll(".admin-only").forEach((element) => {
        element.style.display = "block"
      })
    }

    // Load recent activities
    updateRecentActivity()

    // Setup form handlers
    setupFormHandlers()
  }
})

// Updated content display function
async function showContent(sectionId, subsectionId) {
  if (event) event.preventDefault()

  const user = auth.currentUser
  const sectionData = sectionManager.sections.find((s) => s.id === sectionId)
  const subsectionData = sectionData?.subsections.find((sub) => sub.id === subsectionId)

  if (!sectionData || !subsectionData) {
    alert("Раздел не найден")
    return
  }

  // Check user access
  if (user.role !== "admin") {
    const userAccessLevel = user.accessLevel || 1
    if (userAccessLevel !== subsectionData.access_level) {
      alert("У вас нет доступа к этому разделу")
      return
    }
  }

  switchToContent()

  const contentArea = document.getElementById("dynamic-content")
  if (!contentArea) return

  // Update breadcrumbs
  const breadcrumb = document.getElementById("breadcrumb")
  if (breadcrumb) {
    breadcrumb.innerHTML = `<span>Главная</span><span class="separator">></span><span>${sectionData.name} - ${subsectionData.name}</span>`
  }

  // Get content from server
  const { content, googleDocs, files } = await contentManager.getContent(sectionId, subsectionId)

  let html = `
        <div class="section-header">
            <h1>${sectionData.name} - ${subsectionData.name}</h1>
            <p>Информация и документы раздела</p>
            <div class="section-actions" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                <button onclick="showDashboard()" class="btn-primary">
                    <span class="icon">🏠</span>
                    Главная
                </button>
                ${
                  auth.isAdmin() || user.role === "admin"
                    ? `
                    <button onclick="openAddContentModal('${sectionId}', '${subsectionId}')" class="btn-primary">
                        <span class="icon">📝</span>
                        Добавить информацию
                    </button>
                    <button onclick="openAddDocModal('${sectionId}', '${subsectionId}')" class="btn-primary">
                        <span class="icon">📄</span>
                        Добавить документ
                    </button>
                    <button onclick="openUploadFileModal('${sectionId}', '${subsectionId}')" class="btn-primary">
                        <span class="icon">📁</span>
                        Загрузить файлы
                    </button>
                `
                    : ""
                }
            </div>
        </div>
    `

  const totalItems = content.length + googleDocs.length + files.length

  if (totalItems === 0) {
    html += `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <h3>Раздел пуст</h3>
                <p>В этом разделе пока нет информации. Обратитесь к администратору для добавления материалов.</p>
            </div>
        `
  } else {
    html += '<div class="content-grid">'

    // Display text content
    content.forEach((item) => {
      const isLongContent = item.description.length > 200
      const contentId = `content-${item.id}`
      const savedWidth = localStorage.getItem(`content-width-${item.id}`) || ""
      const widthStyle = savedWidth ? `style="width: ${savedWidth}px;"` : ""
      const adminResizable = auth.isAdmin() || user.role === "admin" ? "admin-resizable" : ""

      html += `
                <div class="content-card ${adminResizable}" ${widthStyle} data-content-id="${item.id}">
                    <div class="card-header">
                        <h3>${item.title}</h3>
                        <span class="date">${new Date(item.created_at).toLocaleDateString("ru-RU")}</span>
                    </div>
                    <div class="card-content">
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
                        ${
                          auth.isAdmin() || user.role === "admin"
                            ? `
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button onclick="editContentFromMenu(${item.id}, '${item.title}', '${item.description.replace(/'/g, "\\'")}', '${sectionId}', '${subsectionId}')" class="btn-edit" style="padding: 5px 10px; font-size: 12px;">
                                    Редактировать
                                </button>
                                <button onclick="deleteContentFromMenu(${item.id}, '${sectionId}', '${subsectionId}')" class="btn-danger" style="padding: 5px 10px; font-size: 12px;">
                                    Удалить
                                </button>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `
    })

    // Display Google docs
    googleDocs.forEach((doc) => {
      html += `
                <div class="content-card">
                    <div class="card-header">
                        <h3>📄 ${doc.title}</h3>
                        <span class="date">${new Date(doc.created_at).toLocaleDateString("ru-RU")}</span>
                    </div>
                    <div class="card-content">
                        <p>Google документ</p>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button onclick="openGoogleDocEmbed('${doc.url}', '${doc.title}')" class="doc-embed-link">
                                <span class="icon">👁️</span>
                                Просмотр
                            </button>
                            <a href="${doc.url}" target="_blank" class="doc-link">
                                <span class="icon">🔗</span>
                                Открыть в Google
                            </a>
                        </div>
                        ${
                          auth.isAdmin() || user.role === "admin"
                            ? `
                            <button onclick="deleteDocFromMenu(${doc.id}, '${sectionId}', '${subsectionId}')" class="btn-danger" style="margin-top: 10px; padding: 5px 10px; font-size: 12px;">
                                Удалить
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            `
    })

    // Display files
    files.forEach((file) => {
      if (file.type && file.type.startsWith("image/")) {
        html += `
                    <div class="photo-gallery-item" onclick="viewPhoto('${file.url}', '${file.name}')">
                        <img src="${file.url}" alt="${file.name}">
                        <div class="photo-info">
                            <div class="photo-title">${file.name}</div>
                            <div class="photo-date">${new Date(file.created_at).toLocaleDateString("ru-RU")}</div>
                        </div>
                        ${
                          auth.isAdmin() || user.role === "admin"
                            ? `
                            <button onclick="event.stopPropagation(); deleteFileFromMenu(${file.id}, '${sectionId}', '${subsectionId}')" class="btn-danger" style="position: absolute; top: 10px; right: 10px; padding: 5px 8px; font-size: 12px;">
                                ✕
                            </button>
                        `
                            : ""
                        }
                    </div>
                `
      } else {
        html += `
                    <div class="content-card">
                        <div class="card-header">
                            <h3>📁 ${file.name}</h3>
                            <span class="date">${new Date(file.created_at).toLocaleDateString("ru-RU")}</span>
                        </div>
                        <div class="card-content">
                            <p>Файл для скачивания</p>
                            <a href="${file.url}" target="_blank" class="doc-link">Скачать файл</a>
                            ${
                              auth.isAdmin() || user.role === "admin"
                                ? `
                                <button onclick="deleteFileFromMenu(${file.id}, '${sectionId}', '${subsectionId}')" class="btn-danger" style="margin-top: 10px; padding: 5px 10px; font-size: 12px;">
                                    Удалить
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                `
      }
    })

    html += "</div>"
  }

  contentArea.innerHTML = html

  if (auth.isAdmin() || user.role === "admin") {
    setupResizeHandlers()
  }
}

// Updated delete functions
async function deleteContentFromMenu(id, sectionId, subsectionId) {
  if (!auth.isAdmin() && auth.currentUser.role !== "admin") return

  if (confirm("Вы уверены, что хотите удалить эту информацию?")) {
    try {
      await apiClient.deleteContent(id)
      showContent(sectionId, subsectionId)
    } catch (error) {
      alert("Ошибка при удалении: " + error.message)
    }
  }
}

async function deleteDocFromMenu(id, sectionId, subsectionId) {
  if (!auth.isAdmin() && auth.currentUser.role !== "admin") return

  if (confirm("Вы уверены, что хотите удалить этот документ?")) {
    try {
      await apiClient.deleteGoogleDoc(id)
      showContent(sectionId, subsectionId)
    } catch (error) {
      alert("Ошибка при удалении: " + error.message)
    }
  }
}

async function deleteFileFromMenu(id, sectionId, subsectionId) {
  if (!auth.isAdmin() && auth.currentUser.role !== "admin") return

  if (confirm("Вы уверены, что хотите удалить этот файл?")) {
    try {
      await apiClient.deleteFile(id)
      showContent(sectionId, subsectionId)
    } catch (error) {
      alert("Ошибка при удалении: " + error.message)
    }
  }
}

// Updated form handlers
function setupFormHandlers() {
  // Content form
  const addContentForm = document.getElementById("addContentForm")
  if (addContentForm) {
    addContentForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const sectionId = document.getElementById("contentSectionId").value
      const subsectionId = document.getElementById("contentSubsectionId").value
      const title = document.getElementById("contentTitle").value
      const description = document.getElementById("contentDescription").value

      if (!sectionId || !subsectionId || !title.trim() || !description.trim()) {
        alert("Заполните все поля")
        return
      }

      try {
        await contentManager.addContent(sectionId, subsectionId, title, description)
        closeModal("addContentModal")
        addContentForm.reset()
        showContent(sectionId, subsectionId)
        alert("Информация успешно добавлена!")
      } catch (error) {
        alert("Ошибка при добавлении: " + error.message)
      }
    })
  }

  // Doc form
  const addDocForm = document.getElementById("addDocForm")
  if (addDocForm) {
    addDocForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const sectionId = document.getElementById("docSectionId").value
      const subsectionId = document.getElementById("docSubsectionId").value
      const title = document.getElementById("docTitle").value
      const url = document.getElementById("docUrl").value

      if (!sectionId || !subsectionId || !title.trim() || !url.trim()) {
        alert("Заполните все поля")
        return
      }

      try {
        await contentManager.addGoogleDoc(title, url, sectionId, subsectionId)
        closeModal("addDocModal")
        addDocForm.reset()
        showContent(sectionId, subsectionId)
        alert("Документ успешно добавлен!")
      } catch (error) {
        alert("Ошибка при добавлении: " + error.message)
      }
    })
  }
}

// Updated file upload
async function uploadFiles() {
  const fileInput = document.getElementById("fileUpload")
  const files = fileInput.files
  const sectionId = document.getElementById("fileSectionId").value
  const subsectionId = document.getElementById("fileSubsectionId").value

  if (files.length === 0) {
    alert("Выберите файлы для загрузки")
    return
  }

  if (!sectionId || !subsectionId) {
    alert("Ошибка: не указан раздел или подраздел")
    return
  }

  try {
    for (const file of files) {
      await contentManager.addFile(file, sectionId, subsectionId)
    }

    closeModal("uploadFileModal")
    fileInput.value = ""
    alert("Файлы успешно загружены")
    showContent(sectionId, subsectionId)
  } catch (error) {
    alert("Ошибка при загрузке: " + error.message)
  }
}

// Keep all other functions from the original menu.js unchanged
// (toggleContent, viewPhoto, openGoogleDocEmbed, etc.)
