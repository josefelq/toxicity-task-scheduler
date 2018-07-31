const axios = require('axios');
const keys = require('../config/keys');

module.exports = async function getSteamUser(steamId) {
  const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
    keys.steamWebAPIKey
  }&steamids=${steamId}`;

  const request = await axios.get(url);
  return request.data.response.players;
};
