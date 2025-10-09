import express from "express";
import cors from "cors";
import { getSongsHandler } from "./routes/songs";
import { getSongPreviewHandler } from "./routes/songPreview";
import { getExportHandler } from "./routes/export";

const app = express();

const allowedOrigins = [
  "https://music-store-frontend.onrender.com",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/api/songs", getSongsHandler);
app.get("/api/songs/preview/:seed", getSongPreviewHandler);
app.get("/api/export", getExportHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
