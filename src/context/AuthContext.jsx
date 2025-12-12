import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../api/client.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'auth_token'

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
	const [user, setUser] = useState(() => decodeUser(localStorage.getItem(TOKEN_KEY)))
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (token) localStorage.setItem(TOKEN_KEY, token)
		else localStorage.removeItem(TOKEN_KEY)
		setAuthToken(token || '')
		setUser(decodeUser(token))
	}, [token])

	const value = useMemo(() => ({
		token,
		user,
		isAuthenticated: Boolean(token),
		authError: error,
		clearError: () => setError(''),
		async login(username, password) {
			setLoading(true); setError('')
			try {
				const res = await api.authLogin({ username, password })
				if (res?.token) setToken(res.token)
				else setError('Invalid response from server')
			} catch (e) {
				setError(e.message || 'Login failed')
			} finally {
				setLoading(false)
			}
		},
		async register(username, password) {
			setLoading(true); setError('')
			try {
				const res = await api.authRegister({ username, password })
				if (res?.token) setToken(res.token)
				else setError('Invalid response from server')
			} catch (e) {
				setError(e.message || 'Registration failed')
			} finally {
				setLoading(false)
			}
		},
		logout() { setToken('') }
	}), [token, error, user])

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

function decodeUser(token) {
	if (!token) return null
	const parts = token.split('.')
	if (parts.length < 2) return null
	try {
		const payload = JSON.parse(atob(parts[1]))
		return { id: payload.id, username: payload.username }
	} catch {
		return null
	}
}


