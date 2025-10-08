import { Request, Response } from "express";
import { generateAudioBuffer } from "../utils/generateSongs";

export async function getSongPreviewHandler(req: Request, res: Response) {
  try {
    const seed = req.params.seed.replace(/-/g, ":"); 
    const audioBuffer = await generateAudioBuffer(seed);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="preview-${seed}.wav"`
    );
    res.send(audioBuffer);
  } catch (error) {
    console.error("❌ Error of generation:", error);
    res.status(500).send("Error generating audio");
  }
}
