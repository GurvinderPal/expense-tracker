import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async(req, res)=>{
    const {userId} = req
    try{
        const expenses = await prisma.expense.findMany({
            where:{
                userId : userId
            }
        })
        res.json(expenses)
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

router.post('/', async(req, res)=>{
    const {name, category, amount, date, note} = req.body
    const {userId} = req
    if(!name || !category || !amount || !date){
        return res.status(400).json({error: 'Please fill all required fields'})
    }
    const correctDate = new Date(date) //needed or else prisma will throw an error as timezone is missing
    try{
        await prisma.expense.create({
            data:{
                userId,
                name,
                category,
                amount : parseFloat(amount),
                date: correctDate,
                note
            }
        })
    }catch(err){
        return res.status(500).send({error: err.message})
    }
    res.json({message: 'Expense added successfully'})
})

router.put('/:id', async(req, res)=>{
    const {id} = req.params
    const {name, category, amount, date, note} = req.body
    if(!name || !category || !amount || !date){
        return res.status(400).json({error: 'Please fill all required fields'})
    }
    try{
        const correctDate = new Date(date)
        await prisma.expense.update({
            where:{
                id: parseInt(id)
            },
            data:{
                name,
                category,
                amount : parseFloat(amount),
                date: correctDate,
                note
            }
        })
    }catch(err){
        return res.status(500).json({error: err.message})
    }
    res.json({message: 'Expense updated successfully'})
})

router.delete('/:id', async(req, res)=>{
    const {id} = req.params
    console.log('Received ID:', req.params.id)
    try{
        await prisma.expense.delete({
            where:{
                id: parseInt(id)
            }
        })
    }catch(err){
        return res.status(500).json({error: err.message})
    }
    res.json({message: 'Expense deleted successfully'})
})

export default router