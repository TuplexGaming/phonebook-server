require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(express.json());
app.use(express.static('build'));
app.use(cors());

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

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person);
  });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    persons = persons.filter(p => p.id !== id);
    response.status(204).end();
  } else {
    response.status(404).end();
  }
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

app.get('/info', (request, response) => {
  const length = persons.length;
  const date = new Date();
  response.send(`
    <p>Phonebook has info for ${length} people</p>
    <p>${date}</p>
  `);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
