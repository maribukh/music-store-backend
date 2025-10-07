"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const songs_1 = require("../src/routes/songs");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api/songs", songs_1.getSongsHandler);
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
