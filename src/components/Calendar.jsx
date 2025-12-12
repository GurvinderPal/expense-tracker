import { useMemo } from 'react'
import { toDateOnlyIso } from '../utils/date.js'

function startOfMonth(date) {
	const d = new Date(date)
	d.setDate(1)
	d.setHours(0,0,0,0)
	return d
}
function endOfMonth(date) {
	const d = new Date(date)
	d.setMonth(d.getMonth() + 1, 0)
	d.setHours(23,59,59,999)
	return d
}
function getMonthDaysGrid(date) {
	const start = startOfMonth(date)
	const end = endOfMonth(date)
	const startDay = start.getDay() // 0 Sun
	const daysInMonth = end.getDate()

	const cells = []
	// prev month spill
	for (let i = 0; i < startDay; i++) cells.push(null)
	// this month
	for (let day = 1; day <= daysInMonth; day++) {
		const d = new Date(start)
		d.setDate(day)
		cells.push(d)
	}
	// pad to full weeks
	while (cells.length % 7 !== 0) cells.push(null)
	return cells
}

export default function Calendar({ monthDate, expenses, onSelectDay }) {
	const cells = useMemo(() => getMonthDaysGrid(monthDate), [monthDate])
	const totalsByDay = useMemo(() => {
		const map = {}
		for (const e of expenses) {
			const key = toDateOnlyIso(e.date)
			map[key] = (map[key] || 0) + Number(e.amount)
		}
		return map
	}, [expenses])

	const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthDate)
	const weekdayShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

	return (
		<div className="calendar">
			<div className="calendar-head">
				<div style={{ fontWeight: 700 }}>{monthLabel}</div>
			</div>
			<div className="calendar-grid" style={{ paddingTop: 8 }}>
				{weekdayShort.map(d => (
					<div key={d} className="helper" style={{ textAlign: 'center', fontWeight: 600 }}>{d}</div>
				))}
				{cells.map((d, idx) => {
					if (!d) return <div key={idx} className="calendar-cell out" />
					const key = toDateOnlyIso(d)
					const total = totalsByDay[key] || 0
					return (
						<div key={idx} className="calendar-cell" onClick={() => onSelectDay(d)}>
							<div className="calendar-date">{d.getDate()}</div>
							<div />
							<div className="calendar-total">{total > 0 ? `$${total.toFixed(2)}` : ''}</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}


