import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { api } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'

const ExpensesContext = createContext(null)

const initialSample = [
	{ id: 'e1', title: 'Groceries', amount: 42.50, date: new Date().toISOString(), category: 'Food' },
	{ id: 'e2', title: 'Uber', amount: 12, date: new Date().toISOString(), category: 'Travel' },
	{ id: 'e3', title: 'Electricity Bill', amount: 68.99, date: new Date().toISOString(), category: 'Bills' }
]

const STORAGE_KEY = 'det_expenses_v1'
const HAS_API = Boolean(import.meta.env.VITE_API_BASE || '/api')

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return initialSample
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : initialSample
	} catch {
		return initialSample
	}
}

function saveToStorage(expenses) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
	} catch {
		// ignore
	}
}

function reducer(state, action) {
	switch (action.type) {
		case 'add':
			return [action.payload, ...state]
		case 'update':
			return state.map(e => e.id === action.payload.id ? action.payload : e)
		case 'delete':
			return state.filter(e => e.id !== action.payload)
		case 'set':
			return Array.isArray(action.payload) ? action.payload : state
		default:
			return state
	}
}

export function ExpensesProvider({ children }) {
	const [expenses, dispatch] = useReducer(reducer, [], loadFromStorage)
	const { isAuthenticated } = useAuth()

	useEffect(() => { if (!HAS_API) saveToStorage(expenses) }, [expenses])

	useEffect(() => {
		if (!HAS_API) return
		if (!isAuthenticated) {
			dispatch({ type: 'set', payload: [] })
			return
		}
		api.listExpenses()
			.then(list => {
				if (Array.isArray(list)) {
					const mapped = list.map(fromBackendExpense)
					dispatch({ type: 'set', payload: mapped })
				}
			})
			.catch(() => {
				// if API fails, leave whatever is in state
			})
	}, [isAuthenticated])

	const actions = useMemo(() => ({
		async addExpense(expense) {
			if (HAS_API) {
				await api.createExpense(toBackendExpense(expense))
				const list = await api.listExpenses()
				dispatch({ type: 'set', payload: Array.isArray(list) ? list.map(fromBackendExpense) : [] })
			} else {
				dispatch({ type: 'add', payload: expense })
			}
		},
		async updateExpense(expense) {
			if (HAS_API) {
				await api.updateExpense(toBackendExpense(expense))
				const list = await api.listExpenses()
				dispatch({ type: 'set', payload: Array.isArray(list) ? list.map(fromBackendExpense) : [] })
			} else {
				dispatch({ type: 'update', payload: expense })
			}
		},
		async deleteExpense(id) {
			if (HAS_API) {
				await api.deleteExpense(id)
				const list = await api.listExpenses()
				dispatch({ type: 'set', payload: Array.isArray(list) ? list.map(fromBackendExpense) : [] })
			} else {
				dispatch({ type: 'delete', payload: id })
			}
		}
	}), [])

	const value = useMemo(() => ({ expenses, ...actions }), [expenses, actions])

	return (
		<ExpensesContext.Provider value={value}>
			{children}
		</ExpensesContext.Provider>
	)
}

export function useExpenses() {
	const ctx = useContext(ExpensesContext)
	if (!ctx) throw new Error('useExpenses must be used within ExpensesProvider')
	return ctx
}

function fromBackendExpense(e) {
	return {
		id: String(e.id),
		title: e.name ?? e.title ?? '',
		amount: Number(e.amount),
		date: new Date(e.date).toISOString(),
		category: e.category ?? 'Other',
		note: e.note
	}
}

function toBackendExpense(e) {
	return {
		id: e.id ? parseInt(e.id, 10) : undefined,
		name: e.title,
		category: e.category,
		amount: Number(e.amount),
		date: e.date,
		note: e.note
	}
}


