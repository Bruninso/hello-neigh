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
    const { bloco, apartamento, status } = req.query;
    let filtro = {};
    
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;
    if (status) filtro.status = status;
    
    const encomendas = await Encomenda.find(filtro).sort({ createdAt: -1 });
    res.json(encomendas);
  } catch (err) {
    console.error('Erro ao buscar encomendas:', err);
    res.status(500).json({ erro: 'Erro ao buscar encomendas' });
  }
});

// PATCH - atualizar status da encomenda
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updateData = { status };
    if (status === 'ENTREGUE') {
      updateData.dataHoraEntrega = new Date();
    }
    
    const encomenda = await Encomenda.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!encomenda) {
      return res.status(404).json({ erro: 'Encomenda não encontrada' });
    }
    
    res.json({ 
      mensagem: 'Status atualizado com sucesso',
      encomenda 
    });
  } catch (err) {
    console.error('Erro ao atualizar encomenda:', err);
    res.status(500).json({ erro: 'Erro ao atualizar encomenda' });
  }
});

module.exports = router;