function errorHandler (error, request, response, next) {
	console.error(error.message, '<--------- error error message--------------------', error.name)
	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}
	if (error.name === 'ValidationError'){
		return response.status(400).send(error.message)
	}
	if(error.name === 'MongoError'){
		return response.status(406).send({error: 'Name is already in phonebook'})
	}
	if(error.name === 'SyntaxError') return response.status(400).send({error: 'Something goes wrong'})
	next(error)
}

module.exports = errorHandler