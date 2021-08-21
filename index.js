////////////////////////////////////////////////////////////////////////////////
require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./mongodb')
const errorHandler = require('./errorHandler')
/*===================================================*/
// eslint-disable-next-line no-undef
const PORT = process.env.PORT
      
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

/*-------- GET http./index ------------------ */
app.get('/', (request, response) => response.send('/buid.index.html'))

/*-------- GET http./info --------------------*/
app.get('/info', (request, response) => {
	Person.find({}).then(result => {
		response.send(`<p>Phonebook has info for ${result.length} people</p>${new Date()}`)
	})
})

/*---------- GET get all db document --------------- */
app.get('/api/persons/', (request, response) => {
	Person.find({}).then(result => response.json(result))       
})

/**--------- GET get single document ----------------------*/
app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(result => {
			if(result) response.status(200).json(result)
			else response.status(404).json({ error: 'person not found on database'})
		})
		.catch(error => next(error))
})

/*------------POST add single document ----------------*/
app.post('/api/persons/', (request, response, next) => {
	const person = new Person({
		name: request.body.name,
		number: request.body.number,
	})
	person.save().then(result => response.status(201).json(result)).catch(error => next(error))
})

/*-------------PUT change single document */
app.put((request, response, next) => {
	console.log(request.body, '<------ ennen')
	Person.findByIdAndUpdate(request.body.id, { name: request.body.name, number: request.body.number }, { runValidators: true })
		.then(result => {
			if(!result && request.body.id){
				response.status(204).end()
			}else response.status(404).end()
		})
		.catch(error => next(error))
})

/**-----------------DELETE removes single document */
app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(result => {
			if(result){
				response.status(204).end()
			}else response.status(404).end()
		})
		.catch(error => next(error))
})

app.use(errorHandler)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})