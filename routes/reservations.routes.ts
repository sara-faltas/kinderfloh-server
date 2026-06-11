import express from "express";
import prisma from "../src/lib/prisma.ts";

const router = express.Router();

// CREATE reservation
router.post("/", async (req, res) => {
  try {
    const {
      parentName,
      email,
      tableNumber,
      eventId,
    } = req.body;

    const event = await prisma.event.findUnique({
      where: {
        id: Number(eventId),
      },
      include: {
        reservations: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const availableTables =
      event.totalTables - event.reservations.length;

    if (availableTables <= 0) {
      return res.status(400).json({
        message: "No tables available",
      });
    }

    const existingReservation =
      await prisma.reservation.findFirst({
        where: {
          eventId: Number(eventId),
          tableNumber: Number(tableNumber),
        },
      });

    if (existingReservation) {
      return res.status(400).json({
        message: "Table already reserved",
      });
    }

    const reservation =
      await prisma.reservation.create({
        data: {
          parentName,
          email,
          tableNumber: Number(tableNumber),
          eventId: Number(eventId),
        },
      });

    res.status(201).json(reservation);
  } catch (error) {
  console.log("RESERVATION ERROR:", error);
  res.status(500).json({
    message: "Failed to create reservation",
    error: error instanceof Error ? error.message : error
  });
}
});

// GET all reservations
router.get("/", async (req, res) => {
  try {
    const reservations =
      await prisma.reservation.findMany({
        include: {
          event: true,
        },
      });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reservations",
    });
  }
});

// DELETE reservation
router.delete("/:id", async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    await prisma.reservation.delete({
      where: {
        id: reservationId,
      },
    });

    res.json({
      message: "Reservation cancelled",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel reservation",
    });
  }
});

export default router;