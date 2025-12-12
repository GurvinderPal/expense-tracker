import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { connectSocket, disconnectSocket, getSocket } from '../api/socket.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Friends() {
	const { isAuthenticated } = useAuth()
	const [friends, setFriends] = useState([])
	const [selected, setSelected] = useState(null)
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState('')
	const [newFriend, setNewFriend] = useState('')
	const [status, setStatus] = useState('')

	useEffect(() => {
		if (!isAuthenticated) return
		api.listFriends().then(setFriends).catch(() => {})
	}, [isAuthenticated])

	useEffect(() => {
		if (!isAuthenticated) return
		const socket = connectSocket()
		socket.on('message:new', (msg) => {
			setMessages((prev) => {
				if (selected && (msg.senderId === selected.id || msg.receiverId === selected.id)) {
					return [...prev, msg]
				}
				return prev
			})
		})
		socket.on('message:error', (err) => {
			setStatus(err?.error || 'Message failed')
		})
		socket.on('connect_error', (err) => {
			setStatus(err.message || 'Socket connection error')
		})
		return () => {
			socket.off('message:new')
			socket.off('message:error')
			socket.off('connect_error')
		}
	}, [isAuthenticated, selected])

	useEffect(() => {
		if (!selected) { setMessages([]); return }
		api.listMessages(selected.id).then(setMessages).catch(() => setMessages([]))
	}, [selected])

	useEffect(() => {
		return () => { disconnectSocket() }
	}, [])

	async function sendMessage() {
		if (!draft.trim() || !selected) return
		const socket = getSocket() || connectSocket()
		socket.emit('message:send', { toUserId: selected.id, content: draft.trim() })
		setDraft('')
	}

	async function addFriend() {
		if (!newFriend.trim()) return
		setStatus('Adding...')
		try {
			await api.addFriend(newFriend.trim())
			const list = await api.listFriends()
			setFriends(list)
			setStatus('Friend added')
			setTimeout(() => setStatus(''), 1500)
		} catch (e) {
			setStatus(e.message || 'Error adding friend')
		}
		setNewFriend('')
	}

	const title = useMemo(() => selected ? selected.username : 'Select a friend', [selected])

	if (!isAuthenticated) {
		return (
			<div className="container">
				<div className="card">
					<h3>Friends</h3>
					<div className="helper">Please log in to use chat.</div>
				</div>
			</div>
		)
	}

	return (
		<div className="container">
			<div className="cards" style={{ gridTemplateColumns: '320px 1fr', gap: 16 }}>
				<div className="card">
					<h3>Friends</h3>
					<div className="field">
						<label>Add by username</label>
						<div style={{ display: 'flex', gap: 8 }}>
							<input className="input" placeholder="username" value={newFriend} onChange={e => setNewFriend(e.target.value)} />
							<button className="btn" type="button" onClick={addFriend}>Add</button>
						</div>
						{status && <div className="helper">{status}</div>}
					</div>
					<div className="list" style={{ marginTop: 12, maxHeight: 400, overflow: 'auto' }}>
						{friends.length === 0 && <div className="helper">No friends yet.</div>}
						{friends.map(f => (
							<button
								key={f.id}
								className="list-item"
								style={{ width: '100%', borderColor: selected?.id === f.id ? 'rgba(59,130,246,.5)' : undefined, textAlign: 'left' }}
								onClick={() => setSelected(f)}
							>
								<div style={{ fontWeight: 600 }}>{f.username}</div>
							</button>
						))}
					</div>
				</div>

				<div className="card" style={{ minHeight: 420, display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 12 }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<h3 style={{ margin: 0 }}>Chat</h3>
						<div className="helper">{title}</div>
					</div>
					<div style={{ border: '1px solid rgba(255,255,255,.05)', borderRadius: 12, padding: 12, overflow: 'auto', background: 'rgba(255,255,255,.01)' }}>
						{!selected && <div className="helper">Select a friend to chat.</div>}
						{selected && messages.map(m => (
							<div key={m.id} style={{ display: 'flex', justifyContent: m.senderId === selected.id ? 'flex-start' : 'flex-end', padding: '4px 0' }}>
								<div style={{
									background: m.senderId === selected.id ? 'rgba(255,255,255,.06)' : 'linear-gradient(135deg, var(--brand), var(--brand-2))',
									color: m.senderId === selected.id ? 'var(--text)' : '#fff',
									padding: '10px 12px',
									borderRadius: 12,
									maxWidth: '70%'
								}}>
									<div style={{ fontSize: 12, opacity: .7 }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
									<div>{m.content}</div>
								</div>
							</div>
						))}
					</div>
					<div style={{ display: 'flex', gap: 10 }}>
						<input className="input" placeholder="Type a message" value={draft} onChange={e => setDraft(e.target.value)} disabled={!selected} />
						<button className="btn" type="button" onClick={sendMessage} disabled={!selected || !draft.trim()}>Send</button>
					</div>
				</div>
			</div>
		</div>
	)
}


