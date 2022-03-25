const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
morgan.token('body', function (req, res) { return req.body })
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(tokens['body'](req))
    ].join(' ')
  }))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/info', (req, res) => {
    res.send(`<div><p>Phonebook has info for ${persons.length} people<p>${new Date()}</div>`)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if(person) {
        res.json(person)
    }else{
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if(person) {
        persons = persons.filter(person => person.id !== id)
        res.status(204).end()
    }else{
        res.status(404).end()
    }
})

app.post('/api/persons', (req, res) => {
    const body = req.body
    if(!body.name || !body.number)return res.status(400).end()
    const existPerson = persons.find(p => p.name === body.name)
    if(existPerson){
       res.status(400).json({ error: 'name must be unique' })
    }else{
        const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        const newPerson = {
            ...body,
            id
        }
        persons = [...persons, newPerson]
        res.json(newPerson)
    }
    
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})