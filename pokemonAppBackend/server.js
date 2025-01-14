const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Pokemon = require('./models/pokemon');
const config = require('./utils/env_variables');
const {Dex} = require('pokemon-showdown');

const app = express();

connectDB();

app.use(cors());

app.get('/api/pokemon/:name', async (req, res) => {
    const pokemonName = req.params.name.toLowerCase();
    try {
        const pokemon = await Pokemon.findOne({ name: pokemonName });
        
        if (pokemon) {
            const img_url = `https://play.pokemonshowdown.com/sprites/gen5/${Dex.species.get(pokemon.name).spriteid}.png`;
            res.json({
                pokemon: pokemon.name.toLowerCase(),
                moveset: pokemon.moveset,
                url: img_url,
            });
        } else {
            res.status(404).json({ error: 'Pokémon not found in the database.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

app.get('/api/random', async (req, res) => {
    const numEntries = await Pokemon.countDocuments();
    const randomIndex = Math.floor(Math.random() * numEntries);
    try {
        const pokemon = await Pokemon.findOne().skip(randomIndex);
        let pokemonName;
        let img_url; 
        if (pokemon.moveset.includes("@")){
            pokemonName = pokemon.moveset.split("@")[0].trim();
        } else{
            pokemonName = pokemon.name;
        }
        pokemonName = pokemonName.split("(")[0].trim();
        img_url = `https://play.pokemonshowdown.com/sprites/gen5/${Dex.species.get(pokemonName).spriteid}.png`;
        res.json({
            pokemon: pokemon.name.toLowerCase(),
            moveset: pokemon.moveset,
            url: img_url,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});


app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
});