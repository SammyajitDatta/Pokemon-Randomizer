const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Pokemon = require('./models/pokemon');
const {setTimeout} = require('timers/promises');
const {Dex} = require('pokemon-showdown');

const generations = ['sv', 'ss', 'sm', 'xy', 'bw', 'dp', 'rs']; 

async function fetchPokemonNames() {
    names = []
    for (let obj of Dex.species.all()){
        if (obj.isNonstandard === 'CAP' || obj.isNonstandard === 'Custom'){
            console.log(obj.name)
            continue
        }
        names.push(obj.name)
    }

    return names
}

async function scrapeMoveset(pokemonName) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        for (const generation of generations) {
            const url = `https://www.smogon.com/dex/${generation}/pokemon/${pokemonName}/`;
            console.log(`Trying URL: ${url}`);

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

                const exportButton = await page.$('.ExportButton');
                if (exportButton) {
                    console.log(`Found Export button for ${pokemonName} on ${generation}.`);

                    await exportButton.click();

                    await page.waitForSelector('textarea', { timeout: 10000 });
                    const moveset = await page.$eval('textarea', (textarea) => textarea.value);

                    console.log(`Moveset for ${pokemonName} retrieved from ${generation}.`);
                    return [moveset, url];
                }
            } catch (error) {
                console.log(`Failed to scrape ${pokemonName} from ${generation}:`, error.message);
            }
        }

        console.error(`Moveset not found for ${pokemonName} in any generation.`);
        return null;
    } catch (error) {
        console.error(`Unexpected error while scraping ${pokemonName}:`, error.message);
        return null;
    } finally {
        await browser.close();
    }
}

async function updatePokemonData(pokemonName) {
    const data = await scrapeMoveset(pokemonName);
    if (!data) return;
    const moveset = data[0];
    const url = data[1];
    
    try {
        await Pokemon.findOneAndUpdate(
            { name: pokemonName }, 
            { moveset, url },
            { upsert: true, new: true }
        );
        console.log(`${pokemonName} moveset updated in database.`);
    } catch (error) {
        console.error(`Failed to update ${pokemonName} in database:`, error.message);
    }
}

(async () => {
    await connectDB();
    const pokemonList = await fetchPokemonNames();
    console.log(pokemonList)

    for (const pokemon of pokemonList) {
        console.log(`Scraping data for ${pokemon}...`);
        await updatePokemonData(pokemon.toLowerCase());
    }

    mongoose.connection.close();
    console.log('All Pokémon data has been scraped and saved to the database.');
})();