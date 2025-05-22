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
