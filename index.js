require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();


// Set up middleware
app.use(express.static('build'));
app.use(express.json());

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/', (request, response) => {
  response.send('<h1>Phonebook back end</h1>');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name is missing' });

  } else if (body.number === undefined) {
    return response.status(400).json({ error: 'number is missing' });

  } else {
    const person = new Person({
      name: body.name,
      number: body.number,
    });
    person.save().then(savedPerson => {
      response.json(savedPerson);
    })
  }
});

app.put('/api/persons/:id', (request, response) => {
  const body = request.body;

  const person = { name: body.name, number: body.number };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error));
});

app.get('/info', (request, response) => {
  Person.countDocuments({}, (err, count) => {
    const date = new Date();
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${date}</p>
    `);
  });
});


// Error handling
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
}
app.use(errorHandler);


// Run the app...
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
