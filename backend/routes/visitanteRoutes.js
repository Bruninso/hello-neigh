const express = require('express');
const router = express.Router();
const Visitante = require('../models/visitante.js');
const visitante = require('../models/visitante.js');

// POST - cadastrar visitante
router.post('/', async (req, res) => {
  try {
    const novoVisitante = new Visitante(req.body);
    await novoVisitante.save();
    res.status(201).json({ mensagem: 'Visitante salvo com sucesso', visitante: novoVisitante });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Já existe um visitante com esse CPF.' });
    }

    console.error('Erro ao salvar visitante:', err);
    res.status(500).json({ erro: 'Erro ao salvar visitante', detalhe: err });
  }
});

// GET - listar visitantes
router.get('/', async (req, res) => {
  try {
    const { bloco, apartamento } = req.query;
    let filtro = {};
    
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;
    
    const visitantes = await Visitante.find(filtro).sort({ createdAt: -1 });
    res.json(visitantes);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar visitantes', detalhe: err });
  }
});

module.exports = router;
