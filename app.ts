import express from "express"
import cors from "cors"
import morgan from "morgan"
import "dotenv/config"

import eventsRouter from "./routes/events.routes.js";
import reservationsRouter from "./routes/reservations.routes.js";

const app = express()

// we need to configure this before routes
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.use("/api/events", eventsRouter);
app.use("/api/reservations", reservationsRouter);


app.listen(process.env.PORT || 5000, () => {
  console.clear()
  console.log("Server up and running!")
})