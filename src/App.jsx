import './App.css';
import { useState } from 'react'
import { useEffect } from 'react';
import AnimatedLogo from './AnimatedLogo.jsx';

function App() {
  const [gameName, setGameName] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('eun1'); // default to EUNE
  const [summoner, setSummoner] = useState(null);
  const [ranked, setRanked] = useState([]);
  const [gameVersion, setGameVersion] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [champions, setChampions] = useState({});
  const [champIdToData, setChampIdToData] = useState({});

  const queueNameMap = {
  "RANKED_SOLO_5x5": "Ranked Solo",
  "RANKED_FLEX_SR": "Ranked Flex",
  };

  function formatQueueName(queue) {
  return queue
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  useEffect(() => {
  const fetchChampions = async () => {
    const response = await fetch("https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/champion.json");
    const data = await response.json();

    setChampions(data.data); 

  };

  fetchChampions();
}, []);

useEffect(() => {
  const idToName = {};
  Object.values(champions).forEach(champ => {
      idToName[champ.key] = {
        id: champ.key,
        name: champ.name,
        code: champ.id, 
      }
    });

    setChampIdToData(idToName);
}, [champions]);

useEffect(() => {
  setCurrentName(gameName);
}, [summoner]);

const handleFetch = async () => {
  try {

    // 0. Obtain game version
    const versionRes = await fetch('http://localhost:3001/version');
    const versionData = await versionRes.json();
    const currentVersion = versionData[0]; // Latest version
    setGameVersion(currentVersion);

    // 👇 Convert platform region to Riot routing region for Riot ID API
    const riotRoutingRegion = region === 'eun1' || region === 'euw1' ? 'europe'
                            : region === 'na1' || region === 'br1' || region === 'la1' || region === 'la2' ? 'americas'
                            : 'asia'; // fallback for KR, JP, etc

    // 1. Get PUUID from Riot ID
    const accountRes = await fetch(`http://localhost:3001/account/${riotRoutingRegion}/${gameName}/${tagLine}`);
    const accountData = await accountRes.json();

    console.log("Account data:", accountData); // Should contain puuid

    const puuid = accountData.puuid;

    // 2. Get Profile Info using PUUID and original platform region
    const profileRes = await fetch(`http://localhost:3001/profile/${region}/${puuid}`);
    const profileData = await profileRes.json();

    console.log("Profile data:", profileData);
    console.log("Summoner:", profileData.summoner);
    console.log("Ranked Stats:", profileData.rankedStats);

    // 3. Update state
    setSummoner(profileData.summoner);
    setRanked(profileData.rankedStats);

    // 4. Add favorite champs
    const favoriteChamps = await fetch(`http://localhost:3001/mastery/${region}/${puuid}`);
    const favoriteChampsData = await favoriteChamps.json();
    const favoriteChampsIds = favoriteChampsData.map(champ => champ.championId);
    setFavorites(favoriteChampsIds);
    console.log("Favorites:", favorites);

  } catch (err) {
    console.error("Error fetching profile info:", err);
  }
};

  return (
    <div className="app">
      <div className='main-content'>
        <AnimatedLogo />
        <h1 style={{marginBlockStart: 0}}>League of Stats</h1>

        <div className='input-container'>
          <input
            type="text"
            placeholder="Summoner Name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          />
          <div>
            <span>#</span>
            <input
              type="text"
              placeholder="Tag Line (e.g. EUNE)"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
            />
          </div>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="eun1">EUNE</option>
            <option value="euw1">EUW</option>
            <option value="na1">NA</option>
            <option value="kr">Korea</option>
            <option value="br1">Brazil</option>
            {/* Not adding more at the moment */}
          </select>
        </div>
        <br/>
        <button onClick={handleFetch}>Get Stats!</button>
      </div>
      <div className={summoner ? 'profile-card' : 'null'}>
        {summoner && (
          <>
            <h2>{currentName}</h2>
            <div>
              <h2>{summoner.name}</h2>
              <p>Level: {summoner.summonerLevel}</p>
              <img
                src={`http://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${summoner.profileIconId}.png`}
                alt="Profile Icon"
                width={64}
              />
            </div>
          </>
        )}

        {favorites.length > 0 &&(
          <div className='fav-champ-container' style={{backgroundImage: favorites.length > 0 ? `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champIdToData[favorites[0]].code}_0.jpg)` : 'none'}}> 
            <h3>Favorite Champions:</h3>
            <div className="favorite-champs">
              {favorites.map((champ)=> {
                const champData = champIdToData[champ];
                return (
                  <div key={champ}>
                    <p>{champData.name}</p>
                    <img
                      src={`http://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${champData.code}.png`}
                      alt={champData.name}
                      width={64}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {ranked.length > 0 && (
          <>
          <h3>Ranked Stats:</h3>
            <div className='ranked-stats'>
              {ranked.map((entry) => {
                const queueClean = queueNameMap[entry.queueType] || formatQueueName(entry.queueType);
                return(<div key={queueClean}>
                  <p>{queueClean}</p>
                  <p>
                    {entry.tier} {entry.rank} - {entry.leaguePoints} LP
                  </p>
                  <p>
                    Wins: {entry.wins}, Losses: {entry.losses}, Winrate: {Math.round((entry.wins / (entry.wins + entry.losses)) * 100)}%
                  </p>
                </div>
                )
              })}
            </div>
          </>
        )}

        
      </div>
    </div>
  );
}

export default App;