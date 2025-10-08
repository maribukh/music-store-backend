import { Faker, en, de } from "@faker-js/faker";
import seedrandom from "seedrandom";

export type Song = {
  index: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  likes: number;
  coverSeed: string;
  review: string;
  lyrics: string;
};

type Opts = {
  lang: string;
  seed: string;
  likes: number;
  page: number;
  perPage: number;
};

export function generateSongs(opts: Opts): Song[] {
  const { lang, seed, likes, page, perPage } = opts;
  const locale = lang === "de" ? de : en;
  const faker = new Faker({ locale: [locale, en] });

  const combined = `${seed}:${page}`;
  const rng = seedrandom(combined);

  function probabilisticLikes(avg: number) {
    const base = Math.floor(avg);
    const frac = avg - base;
    const extra = rng() < frac ? 1 : 0;
    return base + extra;
  }

  const songs: Song[] = [];
  for (let i = 0; i < perPage; i++) {
    const idx = (page - 1) * perPage + i + 1;

    const adjective = faker.word.adjective();
    const noun = faker.word.noun();
    const title = `${
      adjective.charAt(0).toUpperCase() + adjective.slice(1)
    } ${noun}`;

    const artist = rng() < 0.5 ? faker.lorem.words(2) : faker.lorem.words(3);

    const album = rng() < 0.3 ? "Single" : faker.lorem.words(2);

    const genre = faker.word.noun();

    const review = faker.lorem.sentences(2);

    const coverSeed = `${seed}:${page}:${idx}`;

    const lyricsRng = seedrandom(`${coverSeed}:lyrics`);
    const lyricLines = faker.lorem
      .lines(Math.floor(lyricsRng() * 5) + 4)
      .split("\n");
    let currentTime = 0;
    const lyricsWithTimestamps = lyricLines
      .map((line) => {
        currentTime += lyricsRng() * 3 + 2;
        const minutes = Math.floor(currentTime / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (currentTime % 60).toFixed(2).padStart(5, "0");
        return `[${minutes}:${seconds}] ${line}`;
      })
      .join("\n");

    songs.push({
      index: idx,
      title: title,
      artist: artist,
      album: album,
      genre: genre,
      likes: probabilisticLikes(likes),
      coverSeed: coverSeed,
      review,
      lyrics: lyricsWithTimestamps,
    });
  }

  return songs;
}

export async function generateAudioBuffer(seed: string, lyrics: string): Promise<Buffer> {
  const faker = new Faker({ locale: [en] });
  const lyricsRng = seedrandom(`${seed}:lyrics`);
  faker.seed(lyricsRng.int32());

  const lyricLines = faker.lorem
    .lines(Math.floor(lyricsRng() * 5) + 4)
    .split("\n");
  let currentTime = 0;
  const lyricsWithTimestamps = lyricLines
    .map((line) => {
      currentTime += lyricsRng() * 3 + 2;
      const minutes = Math.floor(currentTime / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (currentTime % 60).toFixed(2).padStart(5, "0");
      return `[${minutes}:${seconds}] ${line}`;
    })
    .join("\n");

  const parsedLyrics = lyricsWithTimestamps
    .split("\n")
    .map((line) => {
      const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (!match) return null;
      const [, minutes, seconds] = match;
      return parseInt(minutes, 10) * 60 + parseFloat(seconds);
    })
    .filter((time): time is number => time !== null);

  const totalDuration =
    parsedLyrics.length > 0 ? parsedLyrics[parsedLyrics.length - 1] + 3 : 5;

  const rng = seedrandom(seed);
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * totalDuration);
  const dataLen = totalSamples * 2;
  const dataBuf = Buffer.alloc(dataLen);

  const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];

  const melodyPattern = [
    scale[Math.floor(rng() * scale.length)],
    scale[Math.floor(rng() * scale.length)],
    scale[Math.floor(rng() * scale.length)],
    scale[Math.floor(rng() * scale.length)],
  ];

  let melodyNoteIndex = 0;
  const noteDuration = 0.3;
  let samplesUntilNextNote = 0;
  let currentFreq = melodyPattern[0];

  for (let i = 0; i < totalSamples; i++) {
    if (samplesUntilNextNote <= 0) {
      currentFreq = melodyPattern[melodyNoteIndex % melodyPattern.length];
      melodyNoteIndex++;
      samplesUntilNextNote = Math.floor(sampleRate * noteDuration);
    }
    samplesUntilNextNote--;

    const noteTime =
      (sampleRate * noteDuration - samplesUntilNextNote) / sampleRate;
    const fadeOut = 1 - noteTime / noteDuration;
    const amp =
      Math.sin(2 * Math.PI * currentFreq * (i / sampleRate)) * 0.2 * fadeOut;
    const intSample = Math.max(-1, Math.min(1, amp)) * 32767;
    dataBuf.writeInt16LE(Math.floor(intSample), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLen, 40);

  return Buffer.concat([header, dataBuf]);
}
