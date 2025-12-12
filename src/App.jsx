import { Routes, Route, Navigate } from 'react-router-dom'
import { ExpensesProvider } from './context/ExpensesContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import AddExpense from './pages/AddExpense.jsx'
import CalendarView from './pages/CalendarView.jsx'
import Categories from './pages/Categories.jsx'
import Login from './pages/Login.jsx'
import Friends from './pages/Friends.jsx'

export default function App() {
	return (
		<AuthProvider>
			<ExpensesProvider>
				<div className="app-shell">
					<Nav />
					<main className="app-main">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/add" element={<AddExpense />} />
							<Route path="/calendar" element={<CalendarView />} />
							<Route path="/categories" element={<Categories />} />
							<Route path="/friends" element={<Friends />} />
							<Route path="/login" element={<Login />} />
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</main>
				</div>
			</ExpensesProvider>
		</AuthProvider>
	)
}


