import express from 'express'
import bcrypt from 'bcryptjs'
import {PrismaClient} from '@prisma/client'
import jsonwebtoken from 'jsonwebtoken'

const prisma = new PrismaClient()

const router = express.Router()

router.post('/register', async(req,res)=>{

    const {username, password} = req.body
    try{
        const hashedPassword = bcrypt.hashSync(password, 10)

    const user = await prisma.user.create({
        data: {
            username: username,
            password: hashedPassword
        }
    })
    const token = jsonwebtoken.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '15m'})       
    res.status(200).json({token})
    }
    catch(err){
        return res.status(500).json(err.message)
    }
})

router.post('/login', async(req, res) =>{
    const {username, password} = req.body
    try{
        const user = await prisma.user.findUnique({
            where : {username: username}
        })
        if(!user) return res.status(400).json({error: 'Invalid username or password'})

        const isPasswordValid = bcrypt.compareSync(password, user.password)
        if(!isPasswordValid) return res.status(400).json({error: 'Invalid password'})

        const token = jsonwebtoken.sign({id: user.id , username: user.username}, process.env.JWT_SECRET, {expiresIn: '15m'})
        res.status(200).json({token})
    }catch(err){
        res.sendStatus(500).json({error: err.message})
    }
})

export default router