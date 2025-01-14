const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    moveset: { type: String, required: true },
    url: { type: String, required: true },
});

module.exports = mongoose.model('Pokemon', PokemonSchema);