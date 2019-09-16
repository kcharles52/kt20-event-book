const Event = require('../../models/event');
const User = require('../../models/user');
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
  createEvent: async (args, req) => {
    if (!req.isAuthenticated) {
      throw new Error('Unauthenticated! Please login');
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });
    let createdEvent;

    try {
      const savedEvent = await event.save();
      const creator = await User.findById(req.userId);

      createdEvent = { ...savedEvent._doc, creator: user(savedEvent.creator) };

      if (!creator) {
        throw new Error('User not found');
      }

      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (error) {
      throw error;
    }
  }
};
