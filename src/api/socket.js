import { io } from 'socket.io-client'
import { getAuthToken } from './client.js'

let socket = null

export function connectSocket() {
	if (socket?.connected) return socket
	const base = import.meta.env.VITE_API_BASE || '/api'
	const usingProxy = base === '/api'
	const url = usingProxy ? window.location.origin : base
	const path = usingProxy ? '/api/socket.io' : '/socket.io'
	socket = io(url, {
		path,
		transports: ['websocket'],
		auth: { token: getAuthToken() }
	})
	return socket
}

export function getSocket() {
	return socket
}

export function disconnectSocket() {
	if (socket) socket.disconnect()
	socket = null
}


