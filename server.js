require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const { ApolloServer } = require('apollo-server-express');
const {Todo} = require("./models")
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');
const cors = require('cors')
const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

app.use(logger('dev'));
app.use(cors())

app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
      
      res.json(todos);
});

app.post('/todo/new', (req, res) => {
  const todo = new Todo({
      text: req.body.text
  });

  todo.save();

  res.json(todo);
});

app.delete('/todo/delete/:id', async (req, res) => {
  const result = await Todo.findByIdAndDelete(req.params.id)

  res.json(result);
});

app.get('/todo/complete/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  todo.complete = !todo.complete;

  todo.save();

  res.json(todo);
});

server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
