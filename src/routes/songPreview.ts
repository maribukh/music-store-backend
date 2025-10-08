import { Request, Response } from "express";
import { generateAudioBuffer } from "../utils/generateSongs";

export async function getSongPreviewHandler(req: Request, res: Response) {
  try {
    const seed = req.params.seed as string;
    if (!seed) {
      return res.status(400).json({ error: "Seed is required" });
    }

    const audioBuffer = await generateAudioBuffer(seed);

    res.set("Content-Type", "audio/wav");
    res.send(audioBuffer);
  } catch (err) {
    console.error("ERROR ON MUSIC GENERATION:", err);
    res.status(500).json({ error: "Server error during music generation" });
  }
}
