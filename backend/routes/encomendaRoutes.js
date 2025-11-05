const express = require('express');
const router = express.Router();
const Encomenda = require('../models/encomenda.js');

// POST - cadastrar encomenda
router.post('/', async (req, res) => {
  try {
    
    const novaEncomenda = new Encomenda(req.body);
    await novaEncomenda.save();
    
    res.status(201).json({ 
      mensagem: 'Encomenda registrada com sucesso',
      encomenda: novaEncomenda 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    console.error('Erro ao salvar encomenda:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET - listar encomendas
router.get('/', async (req, res) => {
  try {
    const { bloco, apartamento } = req.query;
    let filtro = {};
    
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento; // ✅ Converter para número
    
    const encomendas = await Encomenda.find(filtro).sort({ createdAt: -1 });
    res.json(encomendas);
  } catch (err) {
    console.error('Erro ao buscar encomendas:', err);
    res.status(500).json({ erro: 'Erro ao buscar encomendas' });
  }
});

// PUT - atualizar encomenda por ID
router.put('/:id', async (req, res) => {
  try {

    const encomenda = await Encomenda.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!encomenda) {
      return res.status(404).json({ erro: 'Encomenda não encontrada' });
    }

    res.json({ 
      mensagem: 'Encomenda atualizada com sucesso',
      encomenda 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    console.error('Erro ao atualizar encomenda:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE - excluir encomenda por ID
router.delete('/:id', async (req, res) => {
  try {
    const encomenda = await Encomenda.findByIdAndDelete(req.params.id);
    
    if (!encomenda) {
      return res.status(404).json({ erro: 'Encomenda não encontrada' });
    }
    
    res.json({ mensagem: 'Encomenda excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir encomenda:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;