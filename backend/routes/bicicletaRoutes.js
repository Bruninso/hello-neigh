const express = require('express');
const router = express.Router();
const Bicicleta = require('../models/bicicleta.js');
//const upload = require('../utils/upload');

// POST - cadastrar bicicleta com imagem
router.post('/', async (req, res) => {
  try {
    const novaBicicleta = new Bicicleta(dadosBicicleta);
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

    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Já existe uma bicicleta com este ID.' });
    }

    console.error('Erro ao salvar bicicleta:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET - listar bicicletas
router.get('/', async (req, res) => {
  try {
    const { status, localizacao, bloco, apartamento } = req.query;
    let filtro = {};
    
    if (status) filtro.status = status;
    if (localizacao) filtro.localizacao = localizacao;
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;
    
    const bicicletas = await Bicicleta.find(filtro).sort({ createdAt: -1 });
    res.json(bicicletas);
  } catch (err) {
    console.error('Erro ao buscar bicicletas:', err);
    res.status(500).json({ erro: 'Erro ao buscar bicicletas' });
  }
});

// PATCH - atualizar status da bicicleta
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, localizacao } = req.body;
    
    const bicicleta = await Bicicleta.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        localizacao
      },
      { new: true }
    );
    
    if (!bicicleta) {
      return res.status(404).json({ erro: 'Bicicleta não encontrada' });
    }
    
    res.json({ 
      mensagem: 'Status atualizado com sucesso',
      bicicleta 
    });
  } catch (err) {
    console.error('Erro ao atualizar bicicleta:', err);
    res.status(500).json({ erro: 'Erro ao atualizar bicicleta' });
  }
});

module.exports = router;