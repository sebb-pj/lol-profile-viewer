import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

//Route to get game version
app.get('/version', async (req, res) => {
  console.log('Fetching game version');
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



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
