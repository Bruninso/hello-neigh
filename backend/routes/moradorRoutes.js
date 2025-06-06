const express = require('express');
const router = express.Router();
const Morador = require('../models/morador.js');

//POST
router.post('/', async (req, res) => {
  try {
    // Converter data de "dd/mm/yyyy" para formato ISO reconhecido
    const [dia, mes, ano] = req.body.nascimento.split('/');
    req.body.nascimento = new Date(`${ano}-${mes}-${dia}`);

    const novoMorador = new Morador(req.body);
    await novoMorador.save();
    res.status(201).json({ mensagem: 'Morador salvo com sucesso' });
  } catch (err) {
    // Erro de campos obrigatórios faltando (validação do Mongoose)
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    // Erro de duplicidade (CPF ou RG)
    if (err.code === 11000) {
      const campo = Object.keys(err.keyValue)[0];
      return res.status(409).json({ erro: `Já existe um morador com esse ${campo}.` });
    }
    //Erros inesperados
    console.error('Erro ao salvar no MongoDB', err);
    res.status(500).json({ erro: 'Erro ao salvar morador', detalhe: err });
  }
}); 

//GET
router.get('/', async (req, res) => {
  try {
    const moradores = await Morador.find();
    res.json(moradores);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar moradores', detalhe: err });
  }
});


module.exports = router;
