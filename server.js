import express from 'express'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static(__dirname))

const dataPath = path.join(__dirname, 'data.json')

const allowedFields = ['name', 'cuisine', 'is_open', 'price_range', 'rating', 'number_of_reviews']

const sanitizePayload = (body = {}) => {
    const out = {}
    if (typeof body.name === 'string') out.name = body.name
    if (typeof body.cuisine === 'string') out.cuisine = body.cuisine
    if (typeof body.is_open === 'boolean') out.is_open = body.is_open
    if (typeof body.price_range === 'string') out.price_range = body.price_range
    if (body.rating !== undefined) {
        const val = Number(body.rating)
        if (!Number.isNaN(val)) out.rating = val
    }
    if (body.number_of_reviews !== undefined) {
        const val = parseInt(body.number_of_reviews, 10)
        if (!Number.isNaN(val)) out.number_of_reviews = val
    }
    return out
}

async function readData() {
    const raw = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(raw)
}

async function writeData(data) {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

app.get('/restaurants', asyncHandler(async (req, res) => {
    const data = await readData()
    res.json(data)
}))

app.get('/restaurants/:id', asyncHandler(async (req, res) => {
    const data = await readData()
    const item = data.find(r => String(r.id) === String(req.params.id))
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
}))

app.post('/restaurants', asyncHandler(async (req, res) => {
    const data = await readData()
    const numericIds = data.map(r => parseInt(r.id, 10)).filter(n => !Number.isNaN(n))
    const nextId = (numericIds.length ? Math.max(...numericIds) + 1 : 1).toString()
    const payload = sanitizePayload(req.body)
    const newItem = { id: nextId, ...payload }
    data.push(newItem)
    await writeData(data)
    res.status(201).location(`/restaurants/${newItem.id}`).json(newItem)
}))

app.put('/restaurants/:id', asyncHandler(async (req, res) => {
    const data = await readData()
    const idx = data.findIndex(r => String(r.id) === String(req.params.id))
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    const payload = sanitizePayload(req.body)
    const updated = { ...data[idx], ...payload, id: data[idx].id }
    data[idx] = updated
    await writeData(data)
    res.json(updated)
}))

app.delete('/restaurants/:id', asyncHandler(async (req, res) => {
    const data = await readData()
    const filtered = data.filter(r => String(r.id) !== String(req.params.id))
    if (filtered.length === data.length) return res.status(404).json({ error: 'Not found' })
    await writeData(filtered)
    res.status(204).end()
}))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

// Centralized error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err)
    const status = err.status || 500
    res.status(status).json({ error: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
