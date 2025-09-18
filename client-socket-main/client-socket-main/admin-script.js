let clients = JSON.parse(localStorage.getItem("bankClients")) || []
let accounts = JSON.parse(localStorage.getItem("bankAccounts")) || []
let transactions = JSON.parse(localStorage.getItem("bankTransactions")) || []

// Initialize with sample data if empty
if (clients.length === 0) {
  initializeSampleData()
}

// Premium initialization
document.addEventListener("DOMContentLoaded", () => {
  loadClients()
  loadAccounts()
  updateStats()
  loadRecentTransactions()
  populateClientSelect()
  loadRecentActivity()

  // Add premium loading animations
  setTimeout(() => {
    document.querySelectorAll(".animate-slide-up").forEach((el) => {
      el.style.opacity = "1"
    })
  }, 100)
})

function showSection(sectionName) {
  // Hide all sections with fade out
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("opacity-0")
    setTimeout(() => {
      section.classList.remove("active")
      section.classList.add("hidden")
    }, 150)
  })

  // Remove active state from all nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active", "border-cyan-500", "text-cyan-600")
    btn.classList.add("text-gray-600")
  })

  // Show selected section with fade in
  setTimeout(() => {
    const targetSection = document.getElementById(sectionName + "-section")
    const targetBtn = document.getElementById(sectionName + "-btn")

    targetSection.classList.remove("hidden", "opacity-0")
    targetSection.classList.add("active", "animate-slide-up")

    targetBtn.classList.add("active", "border-cyan-500", "text-cyan-600")
    targetBtn.classList.remove("text-gray-600")

    // Update data if necessary
    if (sectionName === "reports") {
      updateStats()
      loadRecentTransactions()
    }
  }, 200)
}

function showModal(modalName) {
  const modal = document.getElementById(modalName + "-modal")
  modal.style.display = "flex"
  modal.classList.add("animate-fade-scale")

  if (modalName === "create-account") {
    populateClientSelect()
  }

  // Prevent body scroll
  document.body.style.overflow = "hidden"
}

function closeModal(modalName) {
  const modal = document.getElementById(modalName + "-modal")
  modal.classList.add("opacity-0")

  setTimeout(() => {
    modal.style.display = "none"
    modal.classList.remove("opacity-0", "animate-fade-scale")
    document.body.style.overflow = "auto"
  }, 200)
}

// Close modal on backdrop click
window.onclick = (event) => {
  if (event.target.classList.contains("modal")) {
    const modalId = event.target.id.replace("-modal", "")
    closeModal(modalId)
  }
}

document.getElementById("register-client-form").addEventListener("submit", function (e) {
  e.preventDefault()

  const clientData = {
    id: generateId(),
    name: document.getElementById("client-name").value,
    email: document.getElementById("client-email").value,
    document_number: document.getElementById("client-document").value,
    contact_number: document.getElementById("client-contact").value,
    address: {
      country: document.getElementById("client-country").value,
      city: document.getElementById("client-city").value,
      postal_code: document.getElementById("client-postal").value,
    },
    creation_date: new Date().toISOString(),
    status: "Ativo",
  }

  // Enhanced validation
  if (clients.some((client) => client.document_number === clientData.document_number)) {
    showNotification("Cliente com este número de documento já existe!", "error")
    return
  }

  if (clients.some((client) => client.email === clientData.email)) {
    showNotification("Cliente com este email já existe!", "error")
    return
  }

  clients.push(clientData)
  localStorage.setItem("bankClients", JSON.stringify(clients))

  addLog("Cliente Registrado", `Cliente ${clientData.name} registrado com sucesso`, "Admin")

  loadClients()
  populateClientSelect()
  updateStats()
  loadRecentActivity()
  closeModal("register-client")
  this.reset()

  showNotification("Cliente registrado com sucesso!", "success")
})

document.getElementById("create-account-form").addEventListener("submit", function (e) {
  e.preventDefault()

  const clientId = document.getElementById("account-client").value
  const accountType = document.getElementById("account-type").value
  const initialDeposit = Number.parseFloat(document.getElementById("initial-deposit").value)

  const accountData = {
    id: generateAccountNumber(),
    balance: initialDeposit,
    accountType: accountType,
    creation_date: new Date().toISOString(),
    status: "Ativa",
    client_id: clientId,
  }

  accounts.push(accountData)
  localStorage.setItem("bankAccounts", JSON.stringify(accounts))

  // Create initial transaction
  if (initialDeposit > 0) {
    const transaction = {
      id: generateId(),
      type: "Depósito Inicial",
      amount: initialDeposit,
      creation_date: new Date().toISOString(),
      description: `Depósito inicial para abertura de conta ${accountType}`,
      account_id: accountData.id,
    }

    transactions.push(transaction)
    localStorage.setItem("bankTransactions", JSON.stringify(transactions))
  }

  const client = clients.find((c) => c.id === clientId)
  addLog("Conta Criada", `Conta ${accountData.id} criada para ${client.name}`, "Admin")

  loadAccounts()
  updateStats()
  loadRecentActivity()
  closeModal("create-account")
  this.reset()

  showNotification(`Conta ${accountData.id} criada com sucesso!`, "success")
})

function loadClients() {
  const grid = document.getElementById("clients-grid")
  grid.innerHTML = ""

  if (clients.length === 0) {
    grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">Nenhum cliente registrado ainda.</p>
                <button onclick="showModal('register-client')" class="mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                    Registrar Primeiro Cliente
                </button>
            </div>
        `
    return
  }

  clients.forEach((client, index) => {
    const clientAccounts = accounts.filter((a) => a.client_id === client.id)
    const totalBalance = clientAccounts.reduce((sum, acc) => sum + acc.balance, 0)

    const clientCard = document.createElement("div")
    clientCard.className = "card-hover bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    clientCard.style.animationDelay = `${index * 0.1}s`
    clientCard.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span class="text-white font-bold text-lg">${client.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900">${client.name}</h3>
                        <p class="text-sm text-gray-500">ID: ${client.id}</p>
                    </div>
                </div>
                <span class="status-indicator px-3 py-1 rounded-full text-xs font-semibold ${client.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">
                    ${client.status}
                </span>
            </div>
            
            <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Email:</span>
                    <span class="text-sm font-medium text-gray-900">${client.email}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Documento:</span>
                    <span class="text-sm font-medium text-gray-900">${client.document_number}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Contacto:</span>
                    <span class="text-sm font-medium text-gray-900">${client.contact_number}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Localização:</span>
                    <span class="text-sm font-medium text-gray-900">${client.address.city}, ${client.address.country}</span>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-gray-50 to-cyan-50 rounded-xl p-4 mb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Contas Associadas</p>
                        <p class="text-2xl font-bold text-gray-900">${clientAccounts.length}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Saldo Total</p>
                        <p class="text-2xl font-bold ${totalBalance >= 0 ? "text-emerald-600" : "text-red-600"}">€${totalBalance.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="viewClientDetails('${client.id}')" class="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-eye mr-2"></i>Ver Detalhes
                </button>
                <button onclick="editClient('${client.id}')" class="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-edit mr-2"></i>Editar
                </button>
            </div>
        `
    grid.appendChild(clientCard)
  })
}

function loadAccounts() {
  const grid = document.getElementById("accounts-grid")
  grid.innerHTML = ""

  if (accounts.length === 0) {
    grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-credit-card text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">Nenhuma conta criada ainda.</p>
                <button onclick="showModal('create-account')" class="mt-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                    Criar Primeira Conta
                </button>
            </div>
        `
    return
  }

  accounts.forEach((account, index) => {
    const client = clients.find((c) => c.id === account.client_id)
    const accountTransactions = transactions.filter((t) => t.account_id === account.id)

    const accountCard = document.createElement("div")
    accountCard.className = "card-hover bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    accountCard.style.animationDelay = `${index * 0.1}s`
    accountCard.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                        <i class="fas fa-credit-card text-white text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900">Conta ${account.accountType}</h3>
                        <p class="text-sm text-gray-500">${account.id}</p>
                    </div>
                </div>
                <span class="status-indicator px-3 py-1 rounded-full text-xs font-semibold ${account.status === "Ativa" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">
                    ${account.status}
                </span>
            </div>
            
            <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Cliente:</span>
                    <span class="text-sm font-medium text-gray-900">${client ? client.name : "Cliente não encontrado"}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Criada em:</span>
                    <span class="text-sm font-medium text-gray-900">${new Date(account.creation_date).toLocaleDateString("pt-PT")}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Transações:</span>
                    <span class="text-sm font-medium text-gray-900">${accountTransactions.length}</span>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-4 mb-4">
                <div class="text-center">
                    <p class="text-sm text-gray-600 mb-1">Saldo Atual</p>
                    <p class="text-3xl font-bold ${account.balance >= 0 ? "text-emerald-600" : "text-red-600"}">€${account.balance.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="viewAccountDetails('${account.id}')" class="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-list mr-2"></i>Movimentos
                </button>
                <button onclick="editAccount('${account.id}')" class="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-edit mr-2"></i>Editar
                </button>
            </div>
        `
    grid.appendChild(accountCard)
  })
}

function searchClients() {
  const searchTerm = document.getElementById("client-search").value.toLowerCase()
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.document_number.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.contact_number.includes(searchTerm),
  )

  displayFilteredClients(filteredClients)
}

function searchAccounts() {
  const searchTerm = document.getElementById("account-search").value.toLowerCase()
  const filteredAccounts = accounts.filter((account) => {
    const client = clients.find((c) => c.id === account.client_id)
    return (
      account.id.toLowerCase().includes(searchTerm) ||
      account.accountType.toLowerCase().includes(searchTerm) ||
      (client && client.name.toLowerCase().includes(searchTerm))
    )
  })

  displayFilteredAccounts(filteredAccounts)
}

function updateStats() {
  // Animate numbers
  animateNumber("total-clients", clients.length)
  animateNumber("total-accounts", accounts.length)

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  animateBalance("total-balance", totalBalance)

  const today = new Date().toDateString()
  const todayTransactions = transactions.filter((t) => new Date(t.creation_date).toDateString() === today).length
  animateNumber("today-transactions", todayTransactions)
}

function loadRecentActivity() {
  const container = document.getElementById("recent-activity")
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))
    .slice(0, 5)

  if (recentTransactions.length === 0) {
    container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-chart-line text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">Nenhuma atividade recente</p>
            </div>
        `
    return
  }

  container.innerHTML = recentTransactions
    .map((transaction, index) => {
      const account = accounts.find((a) => a.id === transaction.account_id)
      const client = account ? clients.find((c) => c.id === account.client_id) : null

      return `
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-xl hover:shadow-md transition-all duration-300" style="animation-delay: ${index * 0.1}s">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-exchange-alt text-white text-sm"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-900">${transaction.type}</p>
                        <p class="text-sm text-gray-600">${client ? client.name : "Cliente desconhecido"} • ${new Date(transaction.creation_date).toLocaleString("pt-PT")}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold ${transaction.amount >= 0 ? "text-emerald-600" : "text-red-600"}">
                        €${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p class="text-xs text-gray-500">${transaction.account_id}</p>
                </div>
            </div>
        `
    })
    .join("")
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl max-w-sm animate-fade-scale ${
    type === "success"
      ? "bg-emerald-500 text-white"
      : type === "error"
        ? "bg-red-500 text-white"
        : "bg-cyan-500 text-white"
  }`

  notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span class="font-medium">${message}</span>
        </div>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("opacity-0", "transform", "translate-x-full")
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

function animateNumber(elementId, targetValue) {
  const element = document.getElementById(elementId)
  const startValue = Number.parseInt(element.textContent) || 0
  const duration = 1000
  const startTime = performance.now()

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress)

    element.textContent = currentValue

    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    }
  }

  requestAnimationFrame(updateNumber)
}

function animateBalance(elementId, targetValue) {
  const element = document.getElementById(elementId)
  const startValue = Number.parseFloat(element.textContent.replace("€", "")) || 0
  const duration = 1000
  const startTime = performance.now()

  function updateBalance(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const currentValue = startValue + (targetValue - startValue) * progress

    element.textContent = `€${currentValue.toFixed(2)}`

    if (progress < 1) {
      requestAnimationFrame(updateBalance)
    }
  }

  requestAnimationFrame(updateBalance)
}

function initializeSampleData() {
  const sampleClients = [
    {
      id: "CLI001",
      name: "João Silva",
      email: "joao.silva@email.com",
      document_number: "123456789",
      contact_number: "+351 912 345 678",
      address: {
        country: "Portugal",
        city: "Lisboa",
        postal_code: "1000-001",
      },
      creation_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Ativo",
    },
    {
      id: "CLI002",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      document_number: "987654321",
      contact_number: "+351 913 456 789",
      address: {
        country: "Portugal",
        city: "Porto",
        postal_code: "4000-001",
      },
      creation_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Ativo",
    },
  ]

  const sampleAccounts = [
    {
      id: "ACC001",
      balance: 2500.0,
      accountType: "Corrente",
      creation_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Ativa",
      client_id: "CLI001",
    },
    {
      id: "ACC002",
      balance: 5000.0,
      accountType: "Poupança",
      creation_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Ativa",
      client_id: "CLI002",
    },
  ]

  const sampleTransactions = [
    {
      id: "TXN001",
      type: "Depósito Inicial",
      amount: 2500.0,
      creation_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Depósito inicial para abertura de conta",
      account_id: "ACC001",
    },
    {
      id: "TXN002",
      type: "Depósito Inicial",
      amount: 5000.0,
      creation_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Depósito inicial para abertura de conta",
      account_id: "ACC002",
    },
  ]

  clients = sampleClients
  accounts = sampleAccounts
  transactions = sampleTransactions

  localStorage.setItem("bankClients", JSON.stringify(clients))
  localStorage.setItem("bankAccounts", JSON.stringify(accounts))
  localStorage.setItem("bankTransactions", JSON.stringify(transactions))
}

// Utility functions remain the same
function generateId() {
  return "CLI" + Date.now().toString().slice(-6)
}

function generateAccountNumber() {
  return "ACC" + Date.now().toString().slice(-8)
}

function addLog(type, message, origin) {
  const log = {
    id: generateId(),
    date_time: new Date().toISOString(),
    level: "INFO",
    message: message,
    origin: origin,
  }

  const logs = JSON.parse(localStorage.getItem("bankLogs")) || []
  logs.push(log)
  localStorage.setItem("bankLogs", JSON.stringify(logs))
}

function populateClientSelect() {
  const select = document.getElementById("account-client")
  select.innerHTML = '<option value="">Selecione um cliente...</option>'

  clients.forEach((client) => {
    const option = document.createElement("option")
    option.value = client.id
    option.textContent = `${client.name} (${client.document_number})`
    select.appendChild(option)
  })
}

function viewClientDetails(clientId) {
  const client = clients.find((c) => c.id === clientId)
  const clientAccounts = accounts.filter((a) => a.client_id === clientId)

  const content = document.getElementById("client-details-content")
  content.innerHTML = `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
                <h4 class="text-lg font-bold text-gray-900 mb-4">Informações Pessoais</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-3">
                        <div><span class="font-semibold text-gray-700">Nome:</span> <span class="text-gray-900">${client.name}</span></div>
                        <div><span class="font-semibold text-gray-700">Email:</span> <span class="text-gray-900">${client.email}</span></div>
                        <div><span class="font-semibold text-gray-700">Documento:</span> <span class="text-gray-900">${client.document_number}</span></div>
                        <div><span class="font-semibold text-gray-700">Contacto:</span> <span class="text-gray-900">${client.contact_number}</span></div>
                    </div>
                    <div class="space-y-3">
                        <div><span class="font-semibold text-gray-700">País:</span> <span class="text-gray-900">${client.address.country}</span></div>
                        <div><span class="font-semibold text-gray-700">Cidade:</span> <span class="text-gray-900">${client.address.city}</span></div>
                        <div><span class="font-semibold text-gray-700">Código Postal:</span> <span class="text-gray-900">${client.address.postal_code}</span></div>
                        <div><span class="font-semibold text-gray-700">Status:</span> <span class="px-3 py-1 rounded-full text-xs font-semibold ${client.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">${client.status}</span></div>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 class="text-lg font-bold text-gray-900 mb-4">Contas Associadas (${clientAccounts.length})</h4>
                ${
                  clientAccounts.length > 0
                    ? `<div class="space-y-3">
                        ${clientAccounts
                          .map(
                            (account) => `
                            <div class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h5 class="font-semibold text-gray-900">Conta ${account.accountType}</h5>
                                        <p class="text-sm text-gray-600">${account.id}</p>
                                        <p class="text-xs text-gray-500">Criada em: ${new Date(account.creation_date).toLocaleDateString("pt-PT")}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-2xl font-bold ${account.balance >= 0 ? "text-emerald-600" : "text-red-600"}">€${account.balance.toFixed(2)}</p>
                                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${account.status === "Ativa" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">${account.status}</span>
                                    </div>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>`
                    : '<p class="text-gray-500 text-center py-8">Nenhuma conta associada a este cliente.</p>'
                }
            </div>
        </div>
    `

  showModal("client-details")
}

function loadRecentTransactions() {
  const logContainer = document.getElementById("admin-transactions-log")
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))
    .slice(0, 10)

  if (recentTransactions.length === 0) {
    logContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhuma transação registrada ainda.</p>'
    return
  }

  logContainer.innerHTML = recentTransactions
    .map((transaction) => {
      const account = accounts.find((a) => a.id === transaction.account_id)
      const client = account ? clients.find((c) => c.id === account.client_id) : null

      return `
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-exchange-alt text-white text-sm"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-900">${transaction.type}</p>
                        <p class="text-sm text-gray-600">${client ? client.name : "Cliente desconhecido"} • Conta: ${transaction.account_id}</p>
                        <p class="text-xs text-gray-500">${new Date(transaction.creation_date).toLocaleString("pt-PT")}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xl font-bold ${transaction.amount >= 0 ? "text-emerald-600" : "text-red-600"}">
                        €${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                </div>
            </div>
        `
    })
    .join("")
}

// Placeholder functions for future implementation
function editClient(clientId) {
  showNotification("Funcionalidade de edição será implementada em breve.", "info")
}

function editAccount(accountId) {
  showNotification("Funcionalidade de edição será implementada em breve.", "info")
}

function viewAccountDetails(accountId) {
  showNotification("Funcionalidade de visualização de movimentos será implementada em breve.", "info")
}

function logout() {
  if (confirm("Tem certeza que deseja sair do painel administrativo?")) {
    window.location.href = "index.html"
  }
}

// Helper functions for filtered display
function displayFilteredClients(filteredClients) {
  const grid = document.getElementById("clients-grid")
  grid.innerHTML = ""

  if (filteredClients.length === 0) {
    grid.innerHTML =
      '<div class="col-span-full text-center py-8"><p class="text-gray-500">Nenhum cliente encontrado.</p></div>'
    return
  }

  filteredClients.forEach((client, index) => {
    const clientAccounts = accounts.filter((a) => a.client_id === client.id)
    const totalBalance = clientAccounts.reduce((sum, acc) => sum + acc.balance, 0)

    const clientCard = document.createElement("div")
    clientCard.className = "card-hover bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    clientCard.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span class="text-white font-bold text-lg">${client.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900">${client.name}</h3>
                        <p class="text-sm text-gray-500">ID: ${client.id}</p>
                    </div>
                </div>
                <span class="status-indicator px-3 py-1 rounded-full text-xs font-semibold ${client.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">
                    ${client.status}
                </span>
            </div>
            
            <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Email:</span>
                    <span class="text-sm font-medium text-gray-900">${client.email}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Documento:</span>
                    <span class="text-sm font-medium text-gray-900">${client.document_number}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Contacto:</span>
                    <span class="text-sm font-medium text-gray-900">${client.contact_number}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Localização:</span>
                    <span class="text-sm font-medium text-gray-900">${client.address.city}, ${client.address.country}</span>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-gray-50 to-cyan-50 rounded-xl p-4 mb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Contas Associadas</p>
                        <p class="text-2xl font-bold text-gray-900">${clientAccounts.length}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Saldo Total</p>
                        <p class="text-2xl font-bold ${totalBalance >= 0 ? "text-emerald-600" : "text-red-600"}">€${totalBalance.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="viewClientDetails('${client.id}')" class="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-eye mr-2"></i>Ver Detalhes
                </button>
                <button onclick="editClient('${client.id}')" class="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-edit mr-2"></i>Editar
                </button>
            </div>
        `
    grid.appendChild(clientCard)
  })
}

function displayFilteredAccounts(filteredAccounts) {
  const grid = document.getElementById("accounts-grid")
  grid.innerHTML = ""

  if (filteredAccounts.length === 0) {
    grid.innerHTML =
      '<div class="col-span-full text-center py-8"><p class="text-gray-500">Nenhuma conta encontrada.</p></div>'
    return
  }

  filteredAccounts.forEach((account, index) => {
    const client = clients.find((c) => c.id === account.client_id)
    const accountTransactions = transactions.filter((t) => t.account_id === account.id)

    const accountCard = document.createElement("div")
    accountCard.className = "card-hover bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    accountCard.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                        <i class="fas fa-credit-card text-white text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900">Conta ${account.accountType}</h3>
                        <p class="text-sm text-gray-500">${account.id}</p>
                    </div>
                </div>
                <span class="status-indicator px-3 py-1 rounded-full text-xs font-semibold ${account.status === "Ativa" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}">
                    ${account.status}
                </span>
            </div>
            
            <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Cliente:</span>
                    <span class="text-sm font-medium text-gray-900">${client ? client.name : "Cliente não encontrado"}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Criada em:</span>
                    <span class="text-sm font-medium text-gray-900">${new Date(account.creation_date).toLocaleDateString("pt-PT")}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Transações:</span>
                    <span class="text-sm font-medium text-gray-900">${accountTransactions.length}</span>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-4 mb-4">
                <div class="text-center">
                    <p class="text-sm text-gray-600 mb-1">Saldo Atual</p>
                    <p class="text-3xl font-bold ${account.balance >= 0 ? "text-emerald-600" : "text-red-600"}">€${account.balance.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="viewAccountDetails('${account.id}')" class="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-list mr-2"></i>Movimentos
                </button>
                <button onclick="editAccount('${account.id}')" class="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <i class="fas fa-edit mr-2"></i>Editar
                </button>
            </div>
        `
    grid.appendChild(accountCard)
  })
}
