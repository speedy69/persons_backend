const { request, response, json } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req, res) => JSON.stringify(req.body))
const app = express()
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

const PORT = 3001

let persons = [
    { id: 1, name: "Arto Hellas", number: "040-123456" },
    { id: 2, name: "Ada Lovelace", number: "39-44-234345" },
    { id: 3, name: "Jaska Jokunen", number: "555-4568" },
    { id: 4, name: "Seppo Suikki", number: "555-8554" }
]

const makeId = () => {
    maxId = Math.max(...persons.map(person => person.id))
    return maxId + 1
}

app.get('/', (request, response) => response.send('Hello world and lazy bastards'))

app.get('/info', (request, response) => response.send(`<p>Phonebook has info for ${persons.length} people</p>${new Date()}`))

app.route('/api/persons/')
    .get((request, response) => response.json(persons) )
    .post((request, response) => {
        const body = request.body

        if(!body.name) {
            return response.status(404).json({ error: 'name missing' })
        }
        if(!body.number) {
            return response.status(404).json({ error: 'number missing'})
        }
        const person = { id: makeId(), name: request.body.name, number: request.body.number }
        persons.push(person)
        response.json(person)
    })
    .put((request, response) => {
        response.send('hi')
    })

app.get('/api/persons/:id', (request, response) => {
    person = persons.find(person => person.id === Number(request.params.id))
    if(person){
        response.json(person)
    }else response.status(404).send({ name: "unknown", number: "unknown" })
    
})

app.delete('/api/persons/:id', (request, response) => {
    persons = persons.filter(person => person.id !== Number(request.params.id))
    response.status(204).end()
})



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})