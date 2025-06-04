import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
const RIOT_API_KEY = process.env.RIOT_API_KEY;


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientPath = join(__dirname, '..', 'dist');
app.use(express.static(clientPath));


//Route to get game version
app.get('/version', async (req, res) => {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    res.json(response.data); // returns an array of versions
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game version', details: error.message });
  }
});

// Route to get summoner data
app.get('/account/:region/:gameName/:tagLine', async (req, res) => {
  const { region, gameName, tagLine } = req.params;
  console.log(`Fetching account for ${gameName}#${tagLine} in region ${region}`);

  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );
    res.json(response.data); // contains puuid
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account', details: error.message });
  }
});

// Route to get summoner profile and ranked stats
app.get('/profile/:region/:puuid', async (req, res) => {
  const { region, puuid } = req.params;
  console.log(`Fetching profile for PUUID ${puuid} in region ${region}`);

  try {
    // 1. Get Summoner Info
    const summonerRes = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY,
        },
      }
    );

    const summoner = summonerRes.data;

    // 2. Get Ranked Stats
    const rankedRes = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY,
        },
      }
    );

    const rankedStats = rankedRes.data;

    res.json({
      summoner,
      rankedStats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile or ranked info', details: error.message });
  }
});

app.get('/mastery/:region/:puuid', async (req, res) => {
  const { region, puuid } = req.params;
  console.log(`Fetching mastery for PUUID ${puuid} in region ${region}`);

  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=6`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );
    res.json(response.data); // contains mastery data
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mastery data', details: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//Commented out to avoid serving index.html for all routes
/*
app.get('*', (req, res) => {
  res.sendFile(join(clientPath, 'index.html'));
});
*/
