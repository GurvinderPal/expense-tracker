import { useMemo, useState } from 'react'
import { toDateOnlyIso } from '../utils/date.js'
import ExpenseForm from './ExpenseForm'

export default function DayDetailPanel({ date, expenses, onClose, onUpdate, onDelete }) {
	const dayKey = toDateOnlyIso(date)
	const list = useMemo(() => expenses.filter(e => toDateOnlyIso(e.date) === dayKey), [expenses, dayKey])
	const [editing, setEditing] = useState(null)

	return (
		<aside className="side-panel">
			<div className="panel-head">
				<div>
					<div style={{ fontWeight: 700 }}>Expenses • {new Date(date).toLocaleDateString()}</div>
					<div className="helper">{list.length} item(s)</div>
				</div>
				<button className="icon-btn" onClick={onClose}>Close</button>
			</div>
			<div className="panel-list">
				{list.length === 0 && <div className="helper">No expenses for this day.</div>}
				{list.map(e => (
					<div key={e.id} className="list-item" style={{ gridTemplateColumns: '1fr auto' }}>
						<div>
							<div style={{ fontWeight: 600 }}>{e.title}</div>
							<div className="helper"><span className="badge">{e.category}</span></div>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<div className="amount">${Number(e.amount).toFixed(2)}</div>
							<div className="panel-actions">
								<button className="icon-btn" onClick={() => setEditing(e)}>Edit</button>
								<button className="icon-btn danger" onClick={() => onDelete(e.id)}>Delete</button>
							</div>
						</div>
					</div>
				))}
				{editing && (
					<div className="card">
						<div className="panel-head" style={{ marginBottom: 8 }}>
							<div style={{ fontWeight: 700 }}>Edit Expense</div>
							<button className="icon-btn" onClick={() => setEditing(null)}>Close</button>
						</div>
						<ExpenseForm
							initial={editing}
							onSubmit={(values) => {
								onUpdate({ ...editing, ...values })
								setEditing(null)
							}}
						/>
					</div>
				)}
			</div>
		</aside>
	)
}


