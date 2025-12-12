import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Nav() {
	const [open, setOpen] = useState(false)
	const { isAuthenticated, logout, user } = useAuth()
	const navigate = useNavigate()
	return (
		<>
			<nav className={`nav ${open ? 'open' : ''}`}>
				<button className="mobile-toggle btn secondary" onClick={() => setOpen(o => !o)}>
				Menu
			</button>
			<div className="logo">
				<div className="logo-badge">💸</div>
				<div>
					<div>Expense Tracker</div>
					<div style={{ fontSize: 12, color: 'var(--muted)' }}>Personal Finance</div>
				</div>
			</div>
			<div className="nav-content">
				<div className="nav-group" style={{ display: open ? 'grid' : undefined }}>
					<NavLink to="/" end>
						<span>🏠</span> <span>Home</span>
					</NavLink>
					<NavLink to="/add">
						<span>➕</span> <span>Add Expense</span>
					</NavLink>
					<NavLink to="/calendar">
						<span>🗓️</span> <span>Calendar View</span>
					</NavLink>
					<NavLink to="/categories">
						<span>📊</span> <span>Categories</span>
					</NavLink>
					<NavLink to="/friends">
						<span>👥</span> <span>Friends</span>
					</NavLink>
					{!isAuthenticated && (
						<NavLink to="/login">
							<span>🔐</span> <span>Login</span>
						</NavLink>
					)}
				</div>
				{isAuthenticated && (
					<div className="nav-footer">
						<div className="user-card">
							<div className="user-name" style={{ fontWeight: 700 }}>{user?.username || 'Signed in'}</div>
							<div className="helper" style={{ marginTop: 2 }}>Signed in</div>
							<button
								className="btn secondary"
								style={{ width: '100%', marginTop: 10 }}
								onClick={() => { logout(); navigate('/login', { replace: true }); setOpen(false) }}
							>
								Log out
							</button>
						</div>
					</div>
				)}
			</div>
			</nav>
			{open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
		</>
	)
}


