const BASE_URL = import.meta.env.VITE_API_BASE || '/api'
let memoryToken = ''

export function setAuthToken(token) {
	memoryToken = token || ''
}

export function getAuthToken() {
	return memoryToken || localStorage.getItem('auth_token') || ''
}

function getAuthHeaders() {
	const token = getAuthToken()
	return token ? { Authorization: token } : {}
}

async function request(path, options = {}) {
	const controller = new AbortController()
	const id = setTimeout(() => controller.abort(), options.timeoutMs || 15000)
	try {
		const res = await fetch(`${BASE_URL}${path}`, {
			method: options.method || 'GET',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
				...(options.headers || {})
			},
			body: options.body ? JSON.stringify(options.body) : undefined,
			signal: controller.signal,
			credentials: 'include'
		})
		if (!res.ok) {
			const text = await res.text().catch(() => '')
			throw new Error(text || `HTTP ${res.status}`)
		}
		if (res.status === 204) return null
		const data = await res.json()
		return data
	} finally {
		clearTimeout(id)
	}
}

export const api = {
	async listExpenses() {
		return request('/expenses')
	},
	async createExpense(expense) {
		return request('/expenses', { method: 'POST', body: expense })
	},
	async updateExpense(expense) {
		return request(`/expenses/${encodeURIComponent(expense.id)}`, { method: 'PUT', body: expense })
	},
	async deleteExpense(id) {
		return request(`/expenses/${encodeURIComponent(id)}`, { method: 'DELETE' })
	},
	async authLogin({ username, password }) {
		return request('/auth/login', { method: 'POST', body: { username, password } })
	},
	async authRegister({ username, password }) {
		return request('/auth/register', { method: 'POST', body: { username, password } })
	},
	async listFriends() {
		return request('/friends')
	},
	async addFriend(username) {
		return request('/friends', { method: 'POST', body: { username } })
	},
	async listMessages(friendId) {
		return request(`/messages/${encodeURIComponent(friendId)}`)
	}
}


