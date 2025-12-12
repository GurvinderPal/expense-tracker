import { useMemo } from 'react'
import { useExpenses } from '../context/ExpensesContext.jsx'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default function Categories() {
	const { expenses } = useExpenses()
	const byCategory = useMemo(() => {
		const map = {}
		for (const e of expenses) {
			map[e.category] = (map[e.category] || 0) + Number(e.amount)
		}
		const labels = Object.keys(map)
		const data = labels.map(k => map[k])
		return { labels, data }
	}, [expenses])

	const palette = ['#60a5fa','#34d399','#fbbf24','#f87171','#f472b6','#22d3ee','#a78bfa','#f59e0b']
	const colors = byCategory.labels.map((_, i) => palette[i % palette.length])

	const doughnut = {
		labels: byCategory.labels,
		datasets: [{ data: byCategory.data, backgroundColor: colors, borderWidth: 0 }]
	}
	const bar = {
		labels: byCategory.labels,
		datasets: [{ label: 'Total by Category', data: byCategory.data, backgroundColor: colors }]
	}

	return (
		<div className="container">
			<div className="cards">
				<div className="card span-6">
					<h3>Spending by Category (Pie)</h3>
					{byCategory.labels.length === 0 ? <div className="helper">No data.</div> : <Doughnut data={doughnut} />}
				</div>
				<div className="card span-6">
					<h3>Spending by Category (Bar)</h3>
					{byCategory.labels.length === 0 ? <div className="helper">No data.</div> : <Bar data={bar} options={{ plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,.08)' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,.06)' } } } }} />}
				</div>
			</div>
		</div>
	)
}


