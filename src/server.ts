import express from "express";
import cors from "cors";
import { generateSongs } from "./utils/generateSongs";
import { getSongPreviewHandler } from "./routes/songPreview";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/api/songs", (req, res) => {
  const seed = req.query.seed?.toString() || "default";
  const page = parseInt(req.query.page as string) || 1;
  const songs = generateSongs(seed, page);
  res.json({ songs, totalPages: 20 });
});

app.get("/api/songs/preview/:seed", getSongPreviewHandler);

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
