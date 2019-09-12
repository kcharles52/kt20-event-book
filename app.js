const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

// modals
const Event = require('./models/event');

// create an express application
const app = express();

app.use(bodyParser.json());
app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
      }

      schema {
        query: RootQuery
        mutation:RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find({}).then(events => {
          return events
        }).catch(err => { throw err })
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });

        return event
          .save()
          .then((result) => {
            return { ...result._doc };
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);

// connect to the database
const url =
  process.env.MONGODB_URL ||
  process.env.DB_URL ||
  `mongodb://localhost:27017/${process.env.MONGO_DB}`;
const port = process.env.PORT

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
