import express from "express";
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import authRoutes from "./routers/authRoutes.js"
import expenseRoutes from "./routers/expenseRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import friendRoutes from "./routers/friendRoutes.js";
import messageRoutes from "./routers/messageRoutes.js";

const app = express();
const server = http.createServer(app)
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000;

// Normalize origin (remove trailing slash)
function normalizeOrigin(origin) {
	if (!origin) return origin
	return origin.replace(/\/$/, '')
}

const frontendOrigin = normalizeOrigin(process.env.FRONTEND_ORIGIN || "http://localhost:5173")

const io = new Server(server, {
	cors: {
		origin: frontendOrigin,
		credentials: true
	}
})

app.use(cors({ 
	origin: (origin, callback) => {
		// Allow requests with no origin (mobile apps, Postman, etc.)
		if (!origin) return callback(null, true)
		
		// Normalize the request origin (remove trailing slash)
		const normalizedOrigin = normalizeOrigin(origin)
		
		// Check if the normalized origin matches
		if (normalizedOrigin === frontendOrigin) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/expenses',authMiddleware, expenseRoutes)
app.use('/friends', authMiddleware, friendRoutes)
app.use('/messages', authMiddleware, messageRoutes)

app.get('/', (req,res)=>{
    res.sendStatus(200);
})

io.use((socket, next) => {
	const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']
	if (!token) return next(new Error('No token'))
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		socket.userId = decoded.id
		return next()
	} catch (err) {
		return next(new Error('Invalid token'))
	}
})

io.on('connection', (socket) => {
	const userId = socket.userId
	socket.join(`user:${userId}`)

	socket.on('message:send', async (payload) => {
		try {
			const { toUserId, content } = payload || {}
			if (!toUserId || !content) return
			const receiverId = parseInt(toUserId, 10)
			// ensure friendship
			const isFriend = await prisma.friend.findFirst({
				where: { userId, friendId: receiverId, status: 'accepted' }
			})
			if (!isFriend) {
				socket.emit('message:error', { error: 'Not friends' })
				return
			}
			const message = await prisma.message.create({
				data: { senderId: userId, receiverId, content }
			})
			io.to(`user:${receiverId}`).emit('message:new', message)
			io.to(`user:${userId}`).emit('message:new', message)
		} catch (err) {
			console.error('message:send error', err)
			socket.emit('message:error', { error: 'Failed to send' })
		}
	})
})

server.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
})