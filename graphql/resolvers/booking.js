// modals
const Booking = require('../../models/booking');
const Event = require('../../models/event');

// helper function
const convertDate = require('../../helpers/convertDate');
const { user, singleEvent } = require('./commonFunctions');

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map((booking) => {
        return {
          ...booking._doc,
          user: user(booking.user),
          event: singleEvent(booking.event),
          createdAt: convertDate(booking.createdAt),
          updatedAt: convertDate(booking.updatedAt)
        };
      });
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args) => {
    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: '5d7a46dc707ee632199f8a0e',
        event: fetchedEvent
      });
      const result = await booking.save();

      return {
        ...result._doc,
        user: user(result.user),
        event: singleEvent(result.event),
        createdAt: convertDate(result.createdAt),
        updatedAt: convertDate(result.updatedAt)
      };
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = {
        ...booking.event._doc,
        creator: user(booking.event.creator)
      };

      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  }
};
