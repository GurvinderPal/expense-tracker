import express from 'express'
import jwt from 'jsonwebtoken'

const middleware = (req, res, next) => {
	const token = req.headers['authorization']
	if (!token) {
		return res.status(401).json({ error: 'Access denied. No token provided.' })
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.userId = decoded.id
		return next()
	} catch (err) {
		return res.status(401).json({ error: 'Invalid token' })
	}
}

export default middleware