const result = require('dotenv').config()
const express = require('express'), app = express(), morgan = require('morgan'), cors = require('cors'),
      Person = require('./mongodb'), 
      PORT = process.env.PORT
      
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/', (request, response) => response.send('/buid.index.html'))

app.get('/info', (request, response) => {
        Person.find({}).then(result => {
            response.send(`<p>Phonebook has info for ${result.length} people</p>${new Date()}`)
        })
    })

app.route('/api/persons/')
    .get((request, response) => {
        Person.find({}).then(result => {
            response.json(result)
        })       
    })
    .post((request, response, next) => {
        const person = new Person({
            name: request.body.name,
            number: request.body.number,
        })
        person.save().then(result => response.status(201).json(result)).catch(error => next(error))
    })
    .put((request, response, next) => {
        console.log(request.body, '<------ ennen')
        Person.findByIdAndUpdate(request.body.id, { name: request.body.name, number: request.body.number }, { runValidators: true })
            .then(result => {
                if(!result && request.body.id){
                  response.status(204).end()
                }else response.status(404).end()
            })
            .catch(error => next(error))
    })

app.route('/api/persons/:id')
    .delete((request, response, next) => {
        Person.findByIdAndDelete(request.params.id)
            .then(result => {
                if(result){
                    response.status(204).end()
                }else response.status(404).end()
            })
            .catch(error => next(error))
    })
    .get((request, response, next) => {
        person = Person.findById(request.params.id)
            .then(result => {
                if(result) response.status(200).json(result)
                else response.status(404).json({ error: 'person not found on database'})
            })
            .catch(error => next(error))
    })

const errorHandler = (error, request, response, next) => {
    console.error(error.message, '<--------- error error message--------------------')
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError'){
        if(error.errors['name']){
            return response.status(400).send({error: 'Name missing'})
        }else{
            return response.status(400).send({error: 'Number missing'})
         }
    }
    if(error.name === 'MongoError'){
        return response.status(406).send({error: 'Name is already in phonebook'})
    }
    if(error.name === 'SyntaxError') return response.status(400).send({error: 'Something goes wrong'})
    next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })