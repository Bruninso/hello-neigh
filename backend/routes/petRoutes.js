const express = require('express');
const router = express.Router();
const Pet = require('../models/pet.js');
const auth = require("../middleware/auth");

// POST - cadastrar pet
router.post('/', auth(), async (req, res) => {
  try {
    const novoPet = new Pet(req.body);
    await novoPet.save();

    res.status(201).json({
      mensagem: 'Pet cadastrado com sucesso',
      pet: novoPet
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    console.error('Erro ao salvar pet:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET - listar pets
router.get('/', auth(), async (req, res) => {
  try {
    const { bloco, apartamento, tipoPet } = req.query;
    let filtro = {};

    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;
    if (tipoPet) filtro.tipoPet = tipoPet;

    const pets = await Pet.find(filtro).sort({ createdAt: -1 });
    res.json(pets);

  } catch (err) {
    console.error('Erro ao buscar pets:', err);
    res.status(500).json({ erro: 'Erro ao buscar pets' });
  }
});

// PUT - atualizar pet por ID
router.put('/:id', auth(), async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    res.json({
      mensagem: 'Pet atualizado com sucesso',
      pet
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    console.error('Erro ao atualizar pet:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE - excluir pet por ID
router.delete('/:id', auth(), async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);

    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    res.json({ mensagem: 'Pet excluído com sucesso' });

  } catch (err) {
    console.error('Erro ao excluir pet:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
