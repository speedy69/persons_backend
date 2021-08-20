const mongoose = require('mongoose')

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
        name: { type: String, required: true, unique: true, dropDup:true },
        number: { type: String, required:true }
    })

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Persons', personSchema) 