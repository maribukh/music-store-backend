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
};

type Opts = {
  lang: string;
  seed: string;
  likes: number;
  page: number;
  perPage: number;
};

function hashStringToUInt32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function capitalize(s: string) {
  return s && s[0].toUpperCase() + s.slice(1);
}

export function generateSongs(opts: Opts): Song[] {
  const { lang, seed, likes, page, perPage } = opts;
  const locale = lang === "de" ? de : en;
  const faker = new Faker({ locale: [locale, en] });

  const fakerSeed = hashStringToUInt32(`${seed}:${page}`);
  faker.seed(fakerSeed);

  const structuralRng = seedrandom(`${seed}:${page}:struct`);

  const avg = Math.max(0, Math.min(10, Number(likes) || 0));
  const base = Math.floor(avg);
  const frac = avg - base;

  const songs: Song[] = [];

  for (let i = 0; i < perPage; i++) {
    const index = (page - 1) * perPage + i + 1;

    const adjective = (() => {
      try {
        return faker.word.adjective();
      } catch {
        return faker.word.words(1);
      }
    })();
    const noun = (() => {
      try {
        return faker.word.noun();
      } catch {
        return faker.word.words(1);
      }
    })();

    const title = `${capitalize(adjective)} ${capitalize(noun)}`;

    const isBand = structuralRng() < 0.4;
    const artist = isBand
      ? faker.music && typeof (faker as any).music.band === "function"
        ? (faker as any).music.band()
        : faker.person.fullName()
      : faker.person.fullName();

    const album =
      structuralRng() < 0.5
        ? "Single"
        : (() => {
            try {
              return faker.word.words({ count: 2 });
            } catch {
              return faker.word.words(2);
            }
          })();

    const genre = (() => {
      try {
        return faker.music
          ? faker.music.genre
            ? faker.music.genre()
            : faker.word.noun()
          : faker.word.noun();
      } catch {
        return faker.word.noun();
      }
    })();

    const review = (() => {
      try {
        return faker.lorem.sentences(2);
      } catch {
        return faker.lorem.sentence();
      }
    })();

    let likeCount: number;
    if (avg === 10) {
      likeCount = 10;
    } else if (avg === 0) {
      likeCount = 0;
    } else {
      const perSongRng = seedrandom(`${seed}:${page}:likes:${index}:${avg}`);
      likeCount = base + (perSongRng() < frac ? 1 : 0);
      likeCount = Math.max(0, Math.min(10, Math.floor(likeCount)));
    }

    songs.push({
      index,
      title,
      artist,
      album,
      genre,
      likes: likeCount,
      coverSeed: `${seed}:${index}`,
      review,
    });
  }

  return songs;
}

export async function generateAudioBuffer(seed: string): Promise<Buffer> {
  const rng = seedrandom(seed);
  const sampleRate = 44100;
  const noteDuration = 0.45;
  const notesCount = 6;
  const totalSamples = Math.floor(sampleRate * noteDuration * notesCount);
  const dataLen = totalSamples * 2;
  const dataBuf = Buffer.alloc(dataLen);

  const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];

  let sampleIndex = 0;
  for (let n = 0; n < notesCount; n++) {
    const freq = scale[Math.floor(rng() * scale.length)];
    const samplesForNote = Math.floor(sampleRate * noteDuration);
    for (let i = 0; i < samplesForNote; i++) {
      const t = i / sampleRate;
      const amp =
        Math.sin(2 * Math.PI * freq * t) * (0.25 * (1 - i / samplesForNote));
      const intSample = Math.max(-1, Math.min(1, amp)) * 32767;
      dataBuf.writeInt16LE(Math.floor(intSample), sampleIndex);
      sampleIndex += 2;
    }
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
