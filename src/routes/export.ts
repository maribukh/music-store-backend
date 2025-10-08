import { Request, Response } from "express";
import archiver from "archiver";
import { generateSongs, generateAudioBuffer } from "../utils/generateSongs";

export async function getExportHandler(req: Request, res: Response) {
  try {
    const lang = (req.query.lang as string) || "en";
    const seed = (req.query.seed as string) || "0";
    const likesRaw = req.query.likes as string | undefined;
    const likes = likesRaw !== undefined ? parseFloat(likesRaw) : 1;
    const page = parseInt((req.query.page as string) || "1", 10);
    const perPage = parseInt((req.query.perPage as string) || "20", 10);

    const songs = generateSongs({ lang, seed, likes, page, perPage });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="music-page-${page}.zip"`
    );

    const archive = archiver("zip");

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);

    for (const song of songs) {
      const audioBuffer = await generateAudioBuffer(song.coverSeed);
      const fileName = `${song.artist} - ${song.title}.wav`.replace(
        /[\\/:*?"<>|]/g,
        ""
      );
      archive.append(audioBuffer, { name: fileName });
    }

    await archive.finalize();
  } catch (err) {
    console.error("Error creating zip archive:", err);
    res.status(500).send("Error creating zip archive");
  }
}
