const mongoose = require('mongoose');

const bicicletaSchema = new mongoose.Schema({
  modeloBike: { type: String, required: true },
  corBike: { type: String, required: true },
  /*imagemBike: { type: String },*/
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  nomeMorador: { type: String, required: true },
  }, {
  timestamps: true
});


module.exports = mongoose.model('Bicicleta', bicicletaSchema);