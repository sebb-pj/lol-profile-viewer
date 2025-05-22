// src/App.jsx
import { useState } from 'react'

function App() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('eun1'); // default to EUNE
  const [summoner, setSummoner] = useState(null);
  const [ranked, setRanked] = useState([]);
  const [gameVersion, setGameVersion] = useState('');

const handleFetch = async () => {
  try {

    // 0. Obtain game version
    const versionRes = await fetch('http://localhost:3001/version');
    const versionData = await versionRes.json();
    console.log("Version data:", versionData); // Should contain the game version
    const currentVersion = versionData[0]; // Assuming the first version is the latest
    console.log("Game version:", currentVersion); // Should contain the game version
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

    console.log("Profile responsoe:", profileRes);
    console.log("Profile data:", profileData);
    console.log("Summoner:", profileData.summoner);
    console.log("Ranked Stats:", profileData.rankedStats);

    // 3. Update state
    setSummoner(profileData.summoner);
    setRanked(profileData.rankedStats);
  } catch (err) {
    console.error("Error fetching profile info:", err);
  }
};



  return (
    <>
    <div style={{ padding: '2rem' }}>
      <h1>League of Legends Profile Viewer</h1>

      <input
        type="text"
        placeholder="Summoner Name"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tag Line (e.g. EUNE)"
        value={tagLine}
        onChange={(e) => setTagLine(e.target.value)}
      />
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
        <option value="eun1">EUNE</option>
        <option value="euw1">EUW</option>
        <option value="na1">NA</option>
        <option value="kr">Korea</option>
        <option value="br1">Brazil</option>
        {/* Not adding more at the moment */}
      </select>

      <button onClick={handleFetch}>Get Stats</button>
    </div>
    <div>
      {summoner && (
        <div>
          <h2>{summoner.name}</h2>
          <p>Level: {summoner.summonerLevel}</p>
          <img
            src={`http://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${summoner.profileIconId}.png`}
            alt="Profile Icon"
            width={64}
          />
        </div>
      )}

      {ranked.length > 0 && (
        <div>
          <h3>Ranked Stats:</h3>
          {ranked.map((entry) => (
            <div key={entry.queueType}>
              <p>Queue: {entry.queueType}</p>
              <p>
                {entry.tier} {entry.rank} - {entry.leaguePoints} LP
              </p>
              <p>
                Wins: {entry.wins}, Losses: {entry.losses}, Winrate:{" "}
                {Math.round((entry.wins / (entry.wins + entry.losses)) * 100)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
  );
}

export default App;