const express = require('express');
const router = express.Router();
const Pet = require('../models/pet.js');
//const upload = require('../utils/upload');

// POST - cadastrar pet com imagem
router.post('/', async (req, res) => {
  try {
    const dadosPet = { ...req.body };

    // Converter data de nascimento se fornecida
    if (dadosPet.dataNascimento) {
      const [dia, mes, ano] = dadosPet.dataNascimento.split('/');
      dadosPet.dataNascimento = new Date(`${ano}-${mes}-${dia}`);
    }

    // Converter checkboxes para boolean
    dadosPet.vacinado = dadosPet.vacinado === 'true';
    dadosPet.castrado = dadosPet.castrado === 'true';

    const novoPet = new Pet(dadosPet);
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
router.get('/', async (req, res) => {
  try {
    const { bloco, apartamento, tipo } = req.query;
    let filtro = {};
    
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;
    if (tipo) filtro.tipo = tipo;
    
    const pets = await Pet.find(filtro).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    console.error('Erro ao buscar pets:', err);
    res.status(500).json({ erro: 'Erro ao buscar pets' });
  }
});

module.exports = router;