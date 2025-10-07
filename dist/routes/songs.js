"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSongsHandler = getSongsHandler;
const generateSongs_1 = require("../utils/generateSongs");
async function getSongsHandler(req, res) {
    try {
        const lang = req.query.lang || "en";
        const seed = req.query.seed || "0";
        const likes = parseFloat(req.query.likes || "1");
        const page = parseInt(req.query.page || "1");
        const perPage = parseInt(req.query.perPage || "20");
        const songs = (0, generateSongs_1.generateSongs)({ lang, seed, likes, page, perPage });
        res.json({ page, perPage, songs });
    }
    catch (err) {
        console.error("ERROR ON SERVER:", err);
        res.status(500).json({ error: "server error" });
    }
}
