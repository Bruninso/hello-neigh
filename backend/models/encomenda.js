const mongoose = require('mongoose');

const encomendaSchema = new mongoose.Schema({
  entregarPara: { type: String, required: true },
  recebidaPor: { type: String, required: true },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true},
  dataHoraEntrega: { type: Date },
  status: { type: String, required: true, default: 'RECEBIDA' },
  transportadora: { type: String },
  codigoRastreio: { type: String },
  observacoes: { type: String },
  }, {
  timestamps: true
});

// Criar índice para buscas mais rápidas
encomendaSchema.index({ bloco: 1, apartamento: 1 });
encomendaSchema.index({ status: 1 });

module.exports = mongoose.model('Encomenda', encomendaSchema);