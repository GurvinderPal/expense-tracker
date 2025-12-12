import { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm.jsx'
import { useExpenses } from '../context/ExpensesContext.jsx'

function uid() {
	return Math.random().toString(36).slice(2, 9)
}

export default function AddExpense() {
	const { addExpense } = useExpenses()
	const [saved, setSaved] = useState(false)

	function handleSubmit(values) {
		addExpense({ id: uid(), ...values })
		setSaved(true)
		setTimeout(() => setSaved(false), 2000)
	}

	return (
		<div className="container">
			<div className="card">
				<h3>Add Expense</h3>
				{saved && <div className="success">Expense saved successfully.</div>}
				<ExpenseForm onSubmit={handleSubmit} />
			</div>
		</div>
	)
}


