const express = require('express');
const router = express.Router();
const Visitante = require('../models/visitante.js');

// POST - cadastrar visitante
router.post('/', async (req, res) => {
  try {
    req.body.apartamento = parseInt(req.body.apartamento);
    const novoVisitante = new Visitante(req.body);
    await novoVisitante.save();
    res.status(201).json({ 
      mensagem: 'Visitante salvo com sucesso', 
      visitante: novoVisitante });
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

// PUT 
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    req.body.apartamento = parseInt(req.body.apartamento);

    const visitanteAtualizado = await Visitante.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!visitanteAtualizado) {
      return res.status(404).json({ erro: 'Visitante não encontrado' });
    }

    res.json({ mensagem: 'Visitante atualizado com sucesso', visitante: visitanteAtualizado });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    if (err.code === 11000) {
      const campo = Object.keys(err.keyValue)[0];
      return res.status(409).json({ erro: `Já existe um visitante com esse ${campo}.` });
    }

    console.error('Erro ao atualizar no MongoDB', err);
    res.status(500).json({ erro: 'Erro ao atualizar morador', detalhe: err });
  }
});

// DELETE (remover visitante por ID)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const visitanteExcluido = await Visitante.findByIdAndDelete(id);

    if (!visitanteExcluido) {
      return res.status(404).json({ erro: 'Visitante não encontrado' });
    }

    res.json({ mensagem: 'Visitante excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir no MongoDB', err);
    res.status(500).json({ erro: 'Erro ao excluir visitante', detalhe: err });
  }
});

module.exports = router;
