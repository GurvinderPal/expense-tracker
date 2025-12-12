import { useMemo } from 'react'
import { useExpenses } from '../context/ExpensesContext.jsx'
import { formatCurrency } from '../utils/date.js'
import { Link } from 'react-router-dom'

function isSameMonth(dateA, dateB) {
	const a = new Date(dateA)
	const b = new Date(dateB)
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export default function Home() {
	const { expenses } = useExpenses()
	const now = new Date()
	const monthlyExpenses = useMemo(
		() => expenses.filter(e => isSameMonth(e.date, now)),
		[expenses]
	)
	const monthlyTotal = useMemo(
		() => monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
		[monthlyExpenses]
	)
	const recent = useMemo(() => expenses.slice(0, 6), [expenses])

	return (
		<div className="container">
			<div className="cards">
				<div className="card span-4">
					<h3>Current Month Total</h3>
					<div className="stat">{formatCurrency(monthlyTotal)}</div>
					<div className="helper">Across {monthlyExpenses.length} expenses</div>
				</div>
				<div className="card span-8">
					<h3>Quick Actions</h3>
					<div style={{ display: 'flex', gap: 10 }}>
						<Link className="btn" to="/add">Add Expense</Link>
						<Link className="btn secondary" to="/calendar">Open Calendar</Link>
					</div>
				</div>
			</div>

			<div className="card">
				<h3>Recent Expenses</h3>
				<div className="list">
					{recent.length === 0 && <div className="helper">No expenses yet.</div>}
					{recent.map(e => (
						<div className="list-item" key={e.id}>
							<div>
								<div style={{ fontWeight: 600 }}>{e.title}</div>
								<div className="helper">{new Date(e.date).toLocaleDateString()} • <span className="badge">{e.category}</span></div>
							</div>
							<div className="amount">{formatCurrency(e.amount)}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}


