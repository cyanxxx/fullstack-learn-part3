const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://cyan:${password}@cluster0.joq6e.mongodb.net/person-app?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if(name && number) {
  const person = new Person({
    name,
    number
  })

  person.save().then(_ => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}else{
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}


