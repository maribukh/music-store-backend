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

    const noun = faker.word.noun();
    const adjective = faker.word.adjective();
    const title = `${
      adjective.charAt(0).toUpperCase() + adjective.slice(1)
    } ${noun}`;

    const artist = rng() < 0.5 ? faker.lorem.words(2) : faker.lorem.words(3);

    const album = rng() < 0.3 ? "Single" : faker.lorem.words(2);

    const genre = faker.word.noun();

    const review = faker.lorem.sentences(2);

    songs.push({
      index: idx,
      title: title,
      artist: artist,
      album: album,
      genre: genre,
      likes: probabilisticLikes(likes),
      coverSeed: `${combined}:${idx}`,
      review,
    });
  }

  return songs;
}
