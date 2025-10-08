import { Request, Response } from "express";
import { generateAudioBuffer } from "../utils/generateSongs";

export async function getSongPreviewHandler(req: Request, res: Response) {
  try {
    const safeSeed = (req.params.seed as string) || "";
    const seed = safeSeed.replace(/-/g, ":");

    const buf = await generateAudioBuffer(seed);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", String(buf.length));
    res.send(buf);
  } catch (err) {
    console.error("Error generating audio preview:", err);
    res.status(500).send("Error generating audio");
  }
}
