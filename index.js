const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
morgan.token('body', function (req) { return req.body })
const Person = require('./models/person.js')


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


app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`<div><p>Phonebook has info for ${persons.length} people<p>${new Date()}</div>`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id).then((person) => {
    if(person) {
      res.json(person)
    }else{
      res.status(404).end()
    }
  }).catch(error => next(error))

})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id)
    .then(_ => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if(!body.name || !body.number)return res.status(400).end()
  Person.findOne({ name: body.name }).then(person => {
    if(person) {
      const err = { error: `${body.name} is already added to phonebook` }
      res.status(409).json(err)
      return -1
    }
  }).then((status) => {
    if(status !== -1) {
      const newPerson = new Person({ ...body })
      return newPerson.save().then(result => {
        res.json(result)
      })
    }
  }).catch(error => {
    console.log('error', error)
    next(error)
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const id = req.params.id
  if(!body.name || !body.number)return res.status(400).end()
  Person.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error('error handler', error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
// 这是最后加载的中间件
app.use(errorHandler)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})