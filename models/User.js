const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  steamId: String,
  steamName: String,
  steamAvatar: String,
  suspect: { type: Schema.Types.ObjectId, ref: 'Suspect' },
  following: [{ type: Schema.Types.Object, ref: 'Suspect' }]
});

mongoose.model('users', userSchema);
