const mongoose = require('mongoose');

const visitanteSchema = new mongoose.Schema({
  nomeVisitante: { type: String, required: true },
  cpfVisitante: { type: String, required: true, unique: true },
  nomeMorador: { type: String, required: true }, 
  bloco: { type: String, required: true },
  apartamento: { type: Number, required: true },
}, {
  timestamps: true 
});

module.exports = mongoose.model('Visitante', visitanteSchema);
