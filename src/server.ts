// backend/src/server.ts
import express from "express";
import cors from "cors";
import { getSongsHandler } from "./routes/songs";
import { getSongPreviewHandler } from "./routes/songPreview";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/songs", getSongsHandler);
app.get("/api/songs/preview/:seed", getSongPreviewHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
