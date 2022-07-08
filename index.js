// npm run dev    start the server in dev mode with nodemon
// npm start      start the server without nodemon

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.static('build'));
app.use(cors());

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
];

const generateId = () => {
  const maxId = 100000;
  return Math.floor(Math.random() * maxId);
}


app.get('/', (request, response) => {
  response.send('<h1>Phonebook back end</h1>');
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
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

  if (!body.name) {
    return response.status(400).json({ error: 'name is missing' });

  } else if (!body.number) {
    return response.status(400).json({ error: 'number is missing' });

  } else {
    // Reject if the name matches any already in the array
    const matchedPersons = persons.filter(p => p.name === body.name);
    if (matchedPersons.length > 0) {
      return response.status(400).json({ error: 'name must be unique' });
    }

    // Add new person if required data is available
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number,
    }
    persons = persons.concat(person);
    response.json(person);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
