const mongoose = require('mongoose');

const moradorSchema = new mongoose.Schema({
  nome: String,
  cpf: String,           
  rg: String,            
  telefone: String,      
  bloco: String,
  apartamento: Number,   
  sexo: String,
  nacionalidade: String,
  nascimento: Date       
});

module.exports = mongoose.model('Morador', moradorSchema);
