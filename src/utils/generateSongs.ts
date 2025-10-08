import { faker } from "@faker-js/faker";
import seedrandom from "seedrandom";
import { Writable } from "stream";

const SAMPLE_RATE = 44100;

export function generateSongs(seed: string, page: number) {
  faker.seed(seedrandom(seed + page)());
  return Array.from({ length: 20 }, (_, i) => ({
    index: i + 1,
    title: faker.music.songName(),
    artist: faker.person.fullName(),
    album: faker.music.genre(),
    genre: faker.music.genre(),
    likes: faker.number.int({ min: 100, max: 10000 }),
    coverSeed: `${seed}:${page}:${i}`,
    review: faker.lorem.sentence(),
  }));
}


export async function generateAudioBuffer(seed: string): Promise<Buffer> {
  const rng = seedrandom(seed);
  const durationSeconds = 1; 
  const totalNotes = 8;
  const totalSamples = SAMPLE_RATE * durationSeconds * totalNotes;

  const data = Buffer.alloc(totalSamples * 2);
  let sampleIndex = 0;

  for (let n = 0; n < totalNotes; n++) {
    const freq = 220 + rng() * 880;
    for (let i = 0; i < SAMPLE_RATE * durationSeconds; i++) {
      const t = i / SAMPLE_RATE;
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.3;
      data.writeInt16LE(sample * 32767, sampleIndex);
      sampleIndex += 2;
    }
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);

  return Buffer.concat([header, data]);
}
