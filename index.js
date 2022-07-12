// part 3

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

// Front page
app.get('/', (request, response) => {
  response.send('<h1>Phonebook back end</h1>');
});

// Get all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

// Get person by ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person);
    })
    .catch(error => next(error));
});

// Delete person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

// Create new person
app.post('/api/persons', (request, response, next) => {
  const body = request.body;
  if (body.name === undefined) {
    return response.status(400).json({ error: 'name is missing' });
  } else if (body.number === undefined) {
    return response.status(400).json({ error: 'number is missing' });
  } else {
    Person.find({ name: body.name }).then(person => {
      if (person.length !== 0) {
        return response.status(400).json({ error: `${body.name} already exists` });
      }
    });

    const person = new Person({
      name: body.name,
      number: body.number,
    });
    person.save()
      .then(savedPerson => {
        response.json(savedPerson);
      })
      .catch(error => next(error));
  }
});

// Update person
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = { name: body.name, number: body.number };

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

// Info page
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
  response.status(404).send({ error: 'unkown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);


// Run the app...
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
