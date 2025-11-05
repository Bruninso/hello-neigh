const express = require('express');
const router = express.Router();
const Veiculo = require('../models/veiculo.js');

// POST - cadastrar veículo
router.post('/', async (req, res) => {
  try {
    // Formatar placa (remover espaços e converter para maiúsculo)
    if (req.body.placa) {
      req.body.placa = req.body.placa.replace(/\s/g, '').toUpperCase();
    }
    
    const novoVeiculo = new Veiculo(req.body);
    await novoVeiculo.save();
    
    res.status(201).json({ 
      mensagem: 'Veículo cadastrado com sucesso',
      veiculo: novoVeiculo 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Já existe um veículo com esta placa.' });
    }

    console.error('Erro ao salvar veículo:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET - listar veículos
router.get('/', async (req, res) => {
  try {
    const { bloco, apartamento } = req.query;
    let filtro = {};
    
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;
    
    const veiculos = await Veiculo.find(filtro).sort({ createdAt: -1 });
    res.json(veiculos);
  } catch (err) {
    console.error('Erro ao buscar veículos:', err);
    res.status(500).json({ erro: 'Erro ao buscar veículos' });
  }
});

// GET - veículo por placa
router.get('/:placa', async (req, res) => {
  try {
    const placaFormatada = req.params.placa.replace(/\s/g, '').toUpperCase();
    const veiculo = await Veiculo.findOne({ placa: placaFormatada });
    
    if (!veiculo) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    
    res.json(veiculo);
  } catch (err) {
    console.error('Erro ao buscar veículo:', err);
    res.status(500).json({ erro: 'Erro ao buscar veículo' });
  }
});

// PUT - atualizar veículo por ID
router.put('/:id', async (req, res) => {
  try {
    // Formatar placa se for fornecida
    if (req.body.placa) {
      req.body.placa = req.body.placa.replace(/\s/g, '').toUpperCase();
    }

    const veiculo = await Veiculo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!veiculo) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    res.json({ 
      mensagem: 'Veículo atualizado com sucesso',
      veiculo 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Já existe um veículo com esta placa.' });
    }

    console.error('Erro ao atualizar veículo:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE - excluir veículo por ID
router.delete('/:id', async (req, res) => {
  try {
    const veiculo = await Veiculo.findByIdAndDelete(req.params.id);
    
    if (!veiculo) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }
    
    res.json({ mensagem: 'Veículo excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir veículo:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;