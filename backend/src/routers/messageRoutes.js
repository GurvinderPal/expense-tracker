import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

// Get conversation with friend
router.get('/:friendId', async (req, res) => {
	const userId = req.userId
	const friendId = parseInt(req.params.friendId, 10)
	if (Number.isNaN(friendId)) return res.status(400).json({ error: 'Invalid friendId' })
	try {
		// Ensure they are friends
		const isFriend = await prisma.friend.findFirst({
			where: { userId, friendId, status: 'accepted' }
		})
		if (!isFriend) return res.status(403).json({ error: 'Not friends' })

		const messages = await prisma.message.findMany({
			where: {
				OR: [
					{ senderId: userId, receiverId: friendId },
					{ senderId: friendId, receiverId: userId }
				]
			},
			orderBy: { createdAt: 'asc' }
		})
		return res.json(messages)
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
})

export default router

