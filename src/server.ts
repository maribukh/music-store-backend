import express from "express";
import cors from "cors";
import { getSongsHandler } from "../src/routes/songs";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/songs", getSongsHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
