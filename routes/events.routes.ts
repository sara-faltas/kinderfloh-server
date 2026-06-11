import express from "express";
import prisma from "../src/lib/prisma.ts";

const router = express.Router();

// GET all events with available tables => api/events
router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        reservations: true,
      },
    });

    const eventsWithAvailability = events.map((event: any) => ({
      ...event,
      availableTables:
        event.totalTables - event.reservations.length,
    }));

    res.json(eventsWithAvailability);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET event by id => api/events/:id
router.get("/:id", async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        reservations: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      ...event,
      availableTables:
        event.totalTables - event.reservations.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// CREATE event => api/events
router.post("/", async (req, res) => {
  try {
     console.log(req.body)
    const {
      title,
      description,
      date,
      location,
      totalTables,
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        totalTables: Number(totalTables),
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to create event" });
  }
});

// UPDATE event => api/events/:id
router.put("/:id", async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    const {
      title,
      description,
      date,
      location,
      totalTables,
    } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        date: new Date(date),
        location,
        totalTables: Number(totalTables),
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    await prisma.event.delete({
      where: { id: eventId },
    });

    res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;