const { request, response, json } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

morgan.token('body', (req, res) => JSON.stringify(req.body))
const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

const url = process.env.MONGODB_URI

console.log('conneting to', url)
mongoose.connect(url, { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
        })
        .then(result => console.log('connected to MongoDB'))
        .catch(error => console.log('error connecting to Mongodb', error))

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

const Person = mongoose.model('Persons', personSchema) 

app.get('/', (request, response) => response.send('/buid.index.html'))

app.get('/info', (request, response) => response.send(`<p>Phonebook has info for ${persons.length} people</p>${new Date()}`))

app.route('/api/persons/')
    .get((request, response) => {
        Person.find({}).then(result => {
            response.json(result)
        })       
    })
    .post((request, response) => {
        const body = request.body

        if(!body.name) {
            return response.status(404).json({ error: 'name missing' })
        }
        if(!body.number) {
            return response.status(404).json({ error: 'number missing'})
        }
        const person = new Person({
            name: body.name,
            number: body.number,
        })
        person.save()
        response.status(201).json(person)
    })
    .put((request, response) => {
        Person.findByIdAndUpdate(request.body.id, { number: request.body.number })
            .then(result => response.status(201).json(result))
            .catch(error => response.status(500).end())
    })

app.route('/api/persons/:id')
    .get((request, response) => {
        person = Person.findById(request.params.id)
            .then(result => {
                if(result) response.status(200).json(result)
                else response.status(404).end()
                mongoose.connection.close()
            })
            .catch(error => response.status(500).send(error))
    })
    .delete((request, response) => {
        Person.findByIdAndDelete(request.params.id)
            .then(result => {
                if(result){
                    response.status(204).end()
                } 
                else response.status(404).end()
            })
            .catch(error => response.status(500).end())
    })

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})