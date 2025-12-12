import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
	const { login, register, authError, clearError, isAuthenticated } = useAuth()
	const [mode, setMode] = useState('login') // 'login' | 'register'
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [busy, setBusy] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()

	async function handleSubmit(e) {
		e.preventDefault()
		clearError()
		setBusy(true)
		try {
			if (mode === 'login') {
				await login(username, password)
			} else {
				await register(username, password)
			}
			if (isAuthenticated || localStorage.getItem('auth_token')) {
				const next = (location.state && location.state.next) || '/'
				navigate(next, { replace: true })
			}
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="container">
			<div className="card" style={{ maxWidth: 420, justifySelf: 'center' }}>
				<h3>{mode === 'login' ? 'Login' : 'Create Account'}</h3>
				<form className="form" onSubmit={handleSubmit}>
					<div className="field">
						<label>Username</label>
						<input className="input" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} />
					</div>
					<div className="field">
						<label>Password</label>
						<input className="input" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} />
					</div>
					{authError && <div className="error">{authError}</div>}
					<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
						<button className="btn" type="submit" disabled={busy}>{busy ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Register')}</button>
						<button type="button" className="btn secondary" onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}>
							{mode === 'login' ? 'Create an account' : 'Use existing account'}
						</button>
					</div>
					<div className="helper">A token is stored locally to authorize API requests.</div>
				</form>
			</div>
		</div>
	)
}


