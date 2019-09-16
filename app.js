const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const isAutheticated = require('./middleware/is-auth');

const schema = require('./graphql/schema');
const rootValue = require('./graphql/resolvers');

// create an express application
const app = express();

app.use(bodyParser.json());
app.use(isAutheticated);

app.use(
  '/graphql',
  graphqlHttp({
    schema,
    rootValue,
    graphiql: true
  })
);

// connect to the database
const url =
  process.env.MONGODB_URL ||
  process.env.DB_URL ||
  `mongodb://localhost:27017/${process.env.MONGO_DB}`;
const port = process.env.PORT;

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => {
    app.listen(port);
    console.log(`Running at localhost:${port}`);
  })
  .catch((err) => {
    console.log(err);
  });

mongoose.connection.once('open', () => {
  console.log(`connected to database at ${url}`);
});
