import { useMemo, useState } from 'react'
import { useExpenses } from '../context/ExpensesContext.jsx'
import Calendar from '../components/Calendar.jsx'
import DayDetailPanel from '../components/DayDetailPanel.jsx'
import { toDateOnlyIso } from '../utils/date.js'

export default function CalendarView() {
	const { expenses, updateExpense, deleteExpense } = useExpenses()
	const [cursor, setCursor] = useState(new Date())
	const [activeDate, setActiveDate] = useState(null)

	const monthExpenses = useMemo(() => {
		const d = new Date(cursor)
		const y = d.getFullYear()
		const m = d.getMonth()
		return expenses.filter(e => {
			const ed = new Date(e.date)
			return ed.getFullYear() === y && ed.getMonth() === m
		})
	}, [expenses, cursor])

	const totalMonth = useMemo(() => monthExpenses.reduce((s, e) => s + Number(e.amount), 0), [monthExpenses])

	function changeMonth(delta) {
		const d = new Date(cursor)
		d.setMonth(d.getMonth() + delta)
		setCursor(d)
	}

	const activeList = useMemo(() => {
		if (!activeDate) return []
		const key = toDateOnlyIso(activeDate)
		return expenses.filter(e => toDateOnlyIso(e.date) === key)
	}, [expenses, activeDate])

	return (
		<div className="container">
			<div className="cards">
				<div className="card span-4">
					<h3>Month</h3>
					<div style={{ display: 'flex', gap: 8 }}>
						<button className="icon-btn" onClick={() => changeMonth(-1)}>Prev</button>
						<button className="icon-btn" onClick={() => setCursor(new Date())}>Today</button>
						<button className="icon-btn" onClick={() => changeMonth(1)}>Next</button>
					</div>
				</div>
				<div className="card span-8">
					<h3>Monthly Total</h3>
					<div className="stat">${totalMonth.toFixed(2)}</div>
				</div>
			</div>
			<Calendar
				monthDate={cursor}
				expenses={monthExpenses}
				onSelectDay={setActiveDate}
			/>
			{activeDate && (
				<DayDetailPanel
					date={activeDate}
					expenses={activeList}
					onClose={() => setActiveDate(null)}
					onUpdate={updateExpense}
					onDelete={deleteExpense}
				/>
			)}
		</div>
	)
}


