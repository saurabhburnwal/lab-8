import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import { fileURLToPath } from 'node:url'

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(cors())

// Serve static files (including index.html)
app.use(express.static(__dirname))

const dataPath = path.join(__dirname, 'data.json')

// Helpers to read/write JSON safely
function readData() {
    const raw = fs.readFileSync(dataPath, 'utf-8')
    return JSON.parse(raw)
}

function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
}

// Restaurants CRUD aligned to data.json schema
// GET all
app.get('/restaurants', (req, res) => {
    try {
        const data = readData()
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: 'Failed to read data.json', details: e.message })
    }
})

// GET one by id (string)
app.get('/restaurants/:id', (req, res) => {
    try {
        const data = readData()
        const item = data.find(r => String(r.id) === String(req.params.id))
        if (!item) return res.status(404).json({ error: 'Not found' })
        res.json(item)
    } catch (e) {
        res.status(500).json({ error: 'Failed to read data.json', details: e.message })
    }
})

// CREATE new restaurant (assign next numeric string id)
app.post('/restaurants', (req, res) => {
    try {
        const data = readData()
        const numericIds = data.map(r => parseInt(r.id, 10)).filter(n => !Number.isNaN(n))
        const nextId = (numericIds.length ? Math.max(...numericIds) + 1 : 1).toString()
        const newItem = { id: nextId, ...req.body }
        data.push(newItem)
        writeData(data)
        res.status(201).json(newItem)
    } catch (e) {
        res.status(500).json({ error: 'Failed to create item', details: e.message })
    }
})

// UPDATE by id (keep id unchanged)
app.put('/restaurants/:id', (req, res) => {
    try {
        const data = readData()
        const idx = data.findIndex(r => String(r.id) === String(req.params.id))
        if (idx === -1) return res.status(404).json({ error: 'Not found' })
        const updated = { ...data[idx], ...req.body, id: data[idx].id }
        data[idx] = updated
        writeData(data)
        res.json(updated)
    } catch (e) {
        res.status(500).json({ error: 'Failed to update item', details: e.message })
    }
})

// DELETE by id
app.delete('/restaurants/:id', (req, res) => {
    try {
        const data = readData()
        const filtered = data.filter(r => String(r.id) !== String(req.params.id))
        if (filtered.length === data.length) return res.status(404).json({ error: 'Not found' })
        writeData(filtered)
        res.status(204).end()
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete item', details: e.message })
    }
})

// Root route -> index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})
