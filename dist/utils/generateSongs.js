"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSongs = generateSongs;
const faker_1 = require("@faker-js/faker");
const seedrandom_1 = __importDefault(require("seedrandom"));
function generateSongs(opts) {
    const { lang, seed, likes, page, perPage } = opts;
    const faker = new faker_1.Faker({
        locale: [lang === "de" ? faker_1.de : faker_1.en],
    });
    const combined = `${seed}:${page}`;
    const rng = (0, seedrandom_1.default)(combined);
    function randInt(min, max) {
        return Math.floor(rng() * (max - min + 1)) + min;
    }
    function probabilisticLikes(avg) {
        const base = Math.floor(avg);
        const frac = avg - base;
        const extra = rng() < frac ? 1 : 0;
        return base + extra;
    }
    const songs = [];
    for (let i = 0; i < perPage; i++) {
        const idx = (page - 1) * perPage + i + 1;
        const title = `${faker.word.adjective()} ${faker.music.genre()}`;
        const artist = rng() < 0.4 ? faker.person.fullName() : faker.company.name();
        const album = rng() < 0.5 ? faker.word.words(2) : "Single";
        const genre = faker.music.genre();
        const likeCount = probabilisticLikes(likes);
        const review = faker.lorem.sentences(2);
        songs.push({
            index: idx,
            title: title,
            artist: artist,
            album: album,
            genre: genre,
            likes: likeCount,
            coverSeed: `${combined}:${idx}`,
            review,
        });
    }
    return songs;
}
