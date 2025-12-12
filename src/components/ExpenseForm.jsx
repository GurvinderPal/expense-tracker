import { useMemo, useState } from 'react'
import { toDateOnlyIso } from '../utils/date.js'

const defaultCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Other']

export default function ExpenseForm({ onSubmit, initial }) {
	const [title, setTitle] = useState(initial?.title || '')
	const [amount, setAmount] = useState(initial?.amount ?? '')
	const [category, setCategory] = useState(initial?.category || defaultCategories[0])
	const [date, setDate] = useState(toDateOnlyIso(initial?.date || new Date()))
	const [touched, setTouched] = useState(false)
	const valid = useMemo(() => {
		return title.trim().length > 0 && Number(amount) > 0 && date
	}, [title, amount, date])

	function handleSubmit(e) {
		e.preventDefault()
		setTouched(true)
		if (!valid) return
		onSubmit({
			title: title.trim(),
			amount: Number(amount),
			category,
			date: new Date(date).toISOString()
		})
	}

	return (
		<form className="form" onSubmit={handleSubmit} noValidate>
			<div className="field">
				<label>Title / Description</label>
				<input className="input" placeholder="e.g., Coffee at Starbucks" value={title} onChange={e => setTitle(e.target.value)} />
				{touched && !title.trim() && <div className="error">Please enter a title.</div>}
			</div>
			<div className="row">
				<div className="field">
					<label>Amount</label>
					<input className="input" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
					{touched && !(Number(amount) > 0) && <div className="error">Enter a valid amount.</div>}
				</div>
				<div className="field">
					<label>Category</label>
					<select className="select" value={category} onChange={e => setCategory(e.target.value)}>
						{defaultCategories.map(c => <option key={c} value={c}>{c}</option>)}
					</select>
				</div>
			</div>
			<div className="field">
				<label>Date</label>
				<input className="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
			</div>
			<div className="field">
				<button className="btn" type="submit">{initial ? 'Save Changes' : 'Save Expense'}</button>
				<div className="helper">Your expenses are stored locally in this browser.</div>
			</div>
		</form>
	)
}


