const keys = require('./config/keys');
const getSteamUser = require('./services/steamUser');
const mongoose = require('mongoose');
require('./models/User');
require('./models/Suspect');
require('./models/Stats');

var CronJob = require('cron').CronJob;

const User = mongoose.model('users');
const Suspect = mongoose.model('Suspect');
const Stats = mongoose.model('Stats');

mongoose.connect(
  keys.mongoURI,
  { useNewUrlParser: true }
);

var updateLeaderboard = new CronJob(
  '0 * * * * *',
  async () => {
    const topHundred = await Suspect.find()
      .limit(100)
      .sort({ votesLength: -1 })
      .lean();
    await Stats.remove({});
    let newStatArray = [];
    for (let i = 0; i < topHundred.length; i++) {
      newStatArray.push(topHundred[i]._id);
    }
    await new Stats({ suspects: newStatArray }).save();
    console.log('Updated Leaderboards!');
  },
  true
);

var updateSteamData = new CronJob(
  '0 * * * * *',
  async () => {
    const allSuspects = await Suspect.find();
    const allUsers = await User.find();
    let currentUser = null;
    let currentSteam = null;
    let userChangedName = null;
    let userChangedAvatar = null;
    let someSuspect = null;
    let changedSuspects = [];
    //First update users.
    for (let i = 0; i < allUsers.length; i++) {
      userChangedName = false;
      userChangedAvatar = false;
      currentUser = allUsers[i];
      currentSteam = await getSteamUser(currentUser.steamId);
      if (currentSteam) {
        if (currentSteam.length === 1) {
          if (currentUser.steamName !== currentSteam[0].personaname) {
            userChangedName = true;
            currentUser.steamName = currentSteam[0].personaname;
          }
          if (currentUser.steamAvatar !== currentSteam[0].avatarfull) {
            userChangedAvatar = true;
            currentUser.steamAvatar = currentSteam[0].avatarfull;
          }
          await currentUser.save();
          if (currentUser.suspect && (userChangedName || userChangedAvatar)) {
            someSuspect = await Suspect.findById(currentUser.suspect);
            if (userChangedName) {
              someSuspect.steamName = currentSteam[0].personaname;
            }
            if (userChangedAvatar) {
              someSuspect.steamAvatar = currentSteam[0].avatarfull;
            }
            changedSuspects.push(someSuspect.steamId);
            await someSuspect.save();
          }
        }
      }
    }

    //Lastly, update suspects which dont have user yet.
    for (let j = 0; j < allSuspects.length; j++) {
      currentUser = allSuspects[j];
      if (!(changedSuspects.indexOf(currentUser.steamId) > -1)) {
        currentSteam = await getSteamUser(currentUser.steamId);
        if (currentSteam) {
          if (currentSteam.length === 1) {
            if (currentUser.steamName !== currentSteam[0].personaname) {
              currentUser.steamName = currentSteam[0].personaname;
            }
            if (currentUser.steamAvatar !== currentSteam[0].avatarfull) {
              currentUser.steamAvatar = currentSteam[0].avatarfull;
            }
            await currentUser.save();
          }
        }
      }
    }
    console.log('All users updated!');
  },
  true
);

updateLeaderboard.start();
updateSteamData.start();
