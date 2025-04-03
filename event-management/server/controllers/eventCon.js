// server/controllers/eventCon.js

import Event from '../models/eventSchema.js';

const eventController = {
    // Create a new event
    createEvent: async (req, res) => {
        try {
            const { title, description, date, location } = req.body;
            const event = new Event({
                title,
                description,
                date,
                location
            });
            await event.save();
            res.status(201).json(event);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },

    // Get all events
    getAllEvents: async (req, res) => {
        try {
            const events = await Event.find();
            res.json(events);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },

    // Get a single event by ID
    getEventById: async (req, res) => {
        try {
            const { id } = req.params;
            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).json({
                    message: 'Event not found'
                });
            }
            res.json(event);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },

    // Update an event by ID
    updateEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, date, location } = req.body;
            const event = await Event.findByIdAndUpdate(id,
                {
                    title,
                    description,
                    date,
                    location
                },
                { new: true });
            if (!event) {
                return res.status(404).json({
                    message: 'Event not found'
                });
            }
            res.json(event);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },

    // Delete an event by ID
    deleteEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const event = await Event.findByIdAndDelete(id);
            if (!event) {
                return res.status(404).json({
                    message: 'Event not found'
                });
            }
            res.json({
                message: 'Event deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
};

export default eventController;
