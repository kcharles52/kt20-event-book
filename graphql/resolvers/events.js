const Event = require('../../models/event')
const { user } = require('./commonFunctions');

module.exports = {
  events: () => {
    return Event.find({})
      .then((events) => {
        return events.map((event) => {
          return {
            ...event._doc,
            creator: user(event._doc.creator)
          };
        });
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
        createdEvent = { ...result._doc, creator: user(result.creator) };
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
  }
};
