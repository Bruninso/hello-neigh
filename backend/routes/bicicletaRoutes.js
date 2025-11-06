const express = require('express');
const router = express.Router();
const Bicicleta = require('../models/bicicleta.js');

// POST - cadastrar bicicleta
router.post('/', async (req, res) => {
  try {
const novaBicicleta = new Bicicleta(req.body);
    await novaBicicleta.save();
    
    res.status(201).json({ 
      mensagem: 'Bicicleta cadastrada com sucesso',
      bicicleta: novaBicicleta 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    console.error('Erro ao salvar bicicleta:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET - listar bicicletas
router.get('/', async (req, res) => {
  try {
    const { bloco, apartamento } = req.query;
    let filtro = {};
    
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;
    
    const bicicletas = await Bicicleta.find(filtro).sort({ createdAt: -1 });
    res.json(bicicletas);
  } catch (err) {
    console.error('Erro ao buscar bicicletas:', err);
    res.status(500).json({ erro: 'Erro ao buscar bicicletas' });
  }
});

// PUT - atualizar bicicleta por ID
router.put('/:id', async (req, res) => {
  try {
    const bicicleta = await Bicicleta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bicicleta) {
      return res.status(404).json({ erro: 'Bicicleta não encontrada' });
    }

    res.json({ 
      mensagem: 'Bicicleta atualizada com sucesso',
      bicicleta 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    console.error('Erro ao atualizar bicicleta:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE - excluir bicicleta por ID
router.delete('/:id', async (req, res) => {
  try {
    const bicicleta = await Bicicleta.findByIdAndDelete(req.params.id);
    
    if (!bicicleta) {
      return res.status(404).json({ erro: 'Bicicleta não encontrada' });
    }
    
    res.json({ mensagem: 'Bicicleta excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir bicicleta:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;