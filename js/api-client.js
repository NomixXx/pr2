// API Client for server communication
class ApiClient {
  constructor() {
    this.baseUrl = "/api"
    this.currentUser = null
    this.loadCurrentUser()
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Authentication
  async login(username, password) {
    try {
      const response = await this.request("/auth.php/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })

      if (response.success) {
        this.currentUser = response.user
        localStorage.setItem("uptaxi_currentUser", JSON.stringify(response.user))
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  async logout() {
    try {
      await this.request("/auth.php/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      this.currentUser = null
      localStorage.removeItem("uptaxi_currentUser")
      window.location.href = "index.html"
    }
  }

  loadCurrentUser() {
    const userData = localStorage.getItem("uptaxi_currentUser")
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  }

  isLoggedIn() {
    return this.currentUser !== null
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === "admin"
  }

  // Users
  async getUsers() {
    return await this.request("/users.php")
  }

  async createUser(userData) {
    return await this.request("/users.php", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userData) {
    return await this.request("/users.php", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id) {
    return await this.request(`/users.php/${id}`, {
      method: "DELETE",
    })
  }

  // Sections
  async getSections() {
    return await this.request("/sections.php")
  }

  async createSection(sectionData) {
    return await this.request("/sections.php", {
      method: "POST",
      body: JSON.stringify(sectionData),
    })
  }

  async updateSection(sectionData) {
    return await this.request("/sections.php", {
      method: "PUT",
      body: JSON.stringify(sectionData),
    })
  }

  async deleteSection(id) {
    return await this.request(`/sections.php/${id}`, {
      method: "DELETE",
    })
  }

  // Content
  async getContent(sectionId, subsectionId) {
    return await this.request(`/content.php/${sectionId}/${subsectionId}`)
  }

  async createContent(contentData) {
    return await this.request("/content.php", {
      method: "POST",
      body: JSON.stringify(contentData),
    })
  }

  async updateContent(contentData) {
    return await this.request("/content.php", {
      method: "PUT",
      body: JSON.stringify(contentData),
    })
  }

  async deleteContent(id) {
    return await this.request(`/content.php/${id}`, {
      method: "DELETE",
    })
  }

  // Google Docs
  async createGoogleDoc(docData) {
    return await this.request("/docs.php", {
      method: "POST",
      body: JSON.stringify(docData),
    })
  }

  async deleteGoogleDoc(id) {
    return await this.request(`/docs.php/${id}`, {
      method: "DELETE",
    })
  }

  // Files
  async uploadFile(file, sectionId, subsectionId) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("sectionId", sectionId)
    formData.append("subsectionId", subsectionId)

    return await this.request("/files.php/upload", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  }

  async deleteFile(id) {
    return await this.request(`/files.php/${id}`, {
      method: "DELETE",
    })
  }

  // Activities
  async getActivities() {
    return await this.request("/activities.php")
  }

  async createActivity(activityData) {
    return await this.request("/activities.php", {
      method: "POST",
      body: JSON.stringify(activityData),
    })
  }

  async deleteActivity(id) {
    return await this.request(`/activities.php/${id}`, {
      method: "DELETE",
    })
  }

  // Access Levels
  async getAccessLevels() {
    return await this.request("/access-levels.php")
  }

  async createAccessLevel(levelData) {
    return await this.request("/access-levels.php", {
      method: "POST",
      body: JSON.stringify(levelData),
    })
  }

  async updateAccessLevel(levelData) {
    return await this.request("/access-levels.php", {
      method: "PUT",
      body: JSON.stringify(levelData),
    })
  }

  async deleteAccessLevel(id) {
    return await this.request(`/access-levels.php/${id}`, {
      method: "DELETE",
    })
  }
}

// Global API client instance
const apiClient = new ApiClient()
