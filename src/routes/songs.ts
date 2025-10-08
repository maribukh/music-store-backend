import { Request, Response } from "express";
import { generateSongs } from "../utils/generateSongs";

export function getSongsHandler(req: Request, res: Response) {
  try {
    const lang = (req.query.lang as string) || "en";
    const seed = (req.query.seed as string) || "0";
    const likesRaw = req.query.likes as string | undefined;
    const likes = likesRaw !== undefined ? parseFloat(likesRaw) : 1;
    const page = parseInt((req.query.page as string) || "1", 10);
    const perPage = parseInt((req.query.perPage as string) || "20", 10);

    const songs = generateSongs({ lang, seed, likes, page, perPage });

    const totalPages = 1000;

    res.json({ page, perPage, totalPages, songs });
  } catch (err) {
    console.error("Error in getSongsHandler:", err);
    res.status(500).json({ error: "server error" });
  }
}
