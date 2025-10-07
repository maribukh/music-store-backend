import { Request, Response } from "express";
import { generateSongs, Song } from "../utils/generateSongs";

export async function getSongsHandler(req: Request, res: Response) {
  try {
    const lang = (req.query.lang as string) || "en";
    const seed = (req.query.seed as string) || "0";
    const likes = parseFloat((req.query.likes as string) || "1");
    const page = parseInt((req.query.page as string) || "1");
    const perPage = parseInt((req.query.perPage as string) || "20");

    const songs = generateSongs({ lang, seed, likes, page, perPage });
    res.json({ page, perPage, songs });
  } catch (err) {
    console.error("Error on server:", err);
    res.status(500).json({ error: "server error" });
  }
}
