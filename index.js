const { request, response, json } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req, res) => JSON.stringify(req.body))
const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

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

app.get('/', (request, response) => response.send('/buid.index.html'))

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
        response.status(201).json(person)
    })
    .put((request, response) => {
        console.log(request.body)
        persons.forEach(person => {       
            if(person.id === request.body.id){
                person.number = request.body.number
                return response.status(204).end()
            }
        })
        response.status(400).end()
    })

app.route('/api/persons/:id')
    .get((request, response) => {
        person = persons.find(person => person.id === Number(request.params.id))
        if(person){
            response.status(200).json(person)
        }else response.status(404).send({ name: "unknown", number: "unknown" }) 
    })
    .delete((request, response) => {
        const before = persons.length 
        persons = persons.filter(person => person.id !== Number(request.params.id))
        const after = persons.length
        if(after === before) return response.status(400).end()
        response.status(204).end()
    })

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})