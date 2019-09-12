const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// modals
const Event = require('./models/event');
const User = require('./models/user');

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

      type User {
        email: String!
        password: String
      }

      input UserInput {
        email: String!
        password: String!
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
        createUser(userInput: UserInput): User
      }

      schema {
        query: RootQuery
        mutation:RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find({})
          .then((events) => {
            return events;
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: '5d7a46dc707ee632199f8a0e'
        });
        let createdEvent;

        return event
          .save()
          .then((result) => {
            createdEvent = result._doc;
            return User.findById('5d7a46dc707ee632199f8a0e');
          })
          .then((user) => {
            if (!user) {
              throw new Error('User not found');
            }

            user.createdEvents.push(event);
            return user.save();
          })
          .then(() => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error('User exists already, please login');
            }

            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });

            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null };
          })
          .catch((err) => {
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
