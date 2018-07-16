const keys = require('./config/keys');
const mongoose = require('mongoose');

var CronJob = require('cron').CronJob;

require('./models/User');
require('./models/Suspect');

mongoose.connect(
  keys.mongoURI,
  { useNewUrlParser: true }
);

var updateSteamUsers = new CronJob(
  '0 * * * * *',
  () => {
    console.log('You will see this message every minute');
  },
  true
);

updateSteamUsers.start();
