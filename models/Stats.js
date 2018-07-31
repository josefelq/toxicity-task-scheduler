const mongoose = require('mongoose');
const { Schema } = mongoose;

const statsSchema = new Schema({
  suspects: [{ type: Schema.Types.ObjectId, ref: 'Suspect' }]
});

mongoose.model('Stats', statsSchema);
