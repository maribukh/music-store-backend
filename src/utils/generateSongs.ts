import { Faker, en, de } from "@faker-js/faker";
import seedrandom from "seedrandom";
import { Writer } from "wav";

export type Song = {
  index: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  likes: number;
  coverSeed: string;
  review: string;
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

  const faker = new Faker({
    locale: [lang === "de" ? de : en, en],
  });

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

    const artist = faker.lorem.words({ min: 2, max: 3 });
    const album = rng() < 0.3 ? "Single" : faker.lorem.words(2);
    const genre = faker.word.noun();
    const review = faker.lorem.sentences(2);

    songs.push({
      index: idx,
      title,
      artist,
      album,
      genre,
      likes: probabilisticLikes(likes),
      coverSeed: `${seed}:${idx}`,
      review,
    });
  }
  return songs;
}

export function generateAudioBuffer(seed: string): Promise<Buffer> {
  return new Promise((resolve) => {
    const rng = seedrandom(seed);
    const sampleRate = 44100;
    const durationSeconds = 0.25;
    const numNotes = 8;
    const totalSamples = sampleRate * durationSeconds * numNotes;
    const writer = new Writer({
      sampleRate: sampleRate,
      channels: 1,
      bitDepth: 16,
    });
    const samples = new Int16Array(totalSamples);
    let currentSample = 0;
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    for (let i = 0; i < numNotes; i++) {
      const frequency = scale[Math.floor(rng() * scale.length)];
      const noteDurationSamples = sampleRate * durationSeconds;
      for (let j = 0; j < noteDurationSamples; j++) {
        const amplitude = Math.sin((2 * Math.PI * frequency * j) / sampleRate);
        const fadeOut = 1 - j / noteDurationSamples;
        samples[currentSample++] = amplitude * 32767 * fadeOut;
      }
    }
    writer.write(samples);
    const chunks: Buffer[] = [];
    writer.on("data", (chunk) => chunks.push(chunk));
    writer.on("end", () => resolve(Buffer.concat(chunks)));
    writer.end();
  });
}
