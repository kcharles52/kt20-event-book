// modals
const Event = require('../../models/event');
const User = require('../../models/user');

const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return { ...user._doc, createdEvents: events(user.createdEvents) };
    })
    .catch((err) => {
      throw err;
    });
};

const events = (eventIds) => {
  return Event.find({ _id: { $in: eventIds } })
    .then((events) => {
      return events.map((event) => {
        return { ...event._doc, creator: user(event.creator) };
      });
    })
    .catch((err) => {
      throw err;
    });
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);

    return { ...event._doc, creator: user(event.creator) };
  } catch (error) {
    throw error;
  }
};

module.exports = { events, user, singleEvent };
