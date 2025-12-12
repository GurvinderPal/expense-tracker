import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

// List accepted friends
router.get('/', async (req, res) => {
	const userId = req.userId
	try {
		const friends = await prisma.friend.findMany({
			where: { userId, status: 'accepted' },
			include: { friend: { select: { id: true, username: true } } }
		})
		const mapped = friends.map(f => ({ id: f.friend.id, username: f.friend.username }))
		return res.json(mapped)
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
})

// Add friend by username (auto-accept both sides)
router.post('/', async (req, res) => {
	const userId = req.userId
	const { username } = req.body
	if (!username) return res.status(400).json({ error: 'username is required' })
	try {
		const target = await prisma.user.findUnique({ where: { username } })
		if (!target) return res.status(404).json({ error: 'User not found' })
		if (target.id === userId) return res.status(400).json({ error: 'Cannot add yourself' })

		// Check existing
		const existing = await prisma.friend.findFirst({
			where: { userId, friendId: target.id }
		})
		if (existing) return res.json({ message: 'Already friends' })

		await prisma.friend.createMany({
			data: [
				{ userId, friendId: target.id, status: 'accepted' },
				{ userId: target.id, friendId: userId, status: 'accepted' }
			]
		})
		return res.json({ message: 'Friend added' })
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
})

export default router

