const express = require('express');
const router = express.Router();
const Morador = require('../models/morador.js');

//POST
router.post('/', async (req, res) => {
  try {
    let dataNascimento = req.body.nascimento;

    if (dataNascimento.includes('/')) {
      // dd/mm/yyyy → yyyy-mm-dd
      const [dia, mes, ano] = dataNascimento.split('/');
      dataNascimento = `${ano}-${mes}-${dia}`;
    }

    req.body.nascimento = new Date(dataNascimento);

    req.body.apartamento = parseInt(req.body.apartamento);

    const novoMorador = new Morador(req.body);
    await novoMorador.save();
    res.status(201).json({
      mensagem: 'Morador salvo com sucesso',
      morador: novoMorador
    });
  } catch (err) {
    // Erro de campos obrigatórios faltando (validação do Mongoose)
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    // Erro de duplicidade (CPF ou RG)
    if (err.code === 11000) {
      const campo = Object.keys(err.keyValue)[0];
      return res.status(409).json({ erro: `Já existe um morador com esse ${campo}.` });
    }
    //Erros inesperados
    console.error('Erro ao salvar no MongoDB', err);
    res.status(500).json({ erro: 'Erro ao salvar morador', detalhe: err });
  }
});

//GET
router.get('/', async (req, res) => {
  try {
    const { bloco, apartamento } = req.query;
    let filtro = {};
    
    if (bloco) filtro.bloco = bloco;
    if (apartamento) filtro.apartamento = apartamento;

    const moradores = await Morador.find(filtro).sort({ createdAt: -1 });
    res.json(moradores);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar moradores', detalhe: err });
  }
});

// PUT 
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let dataNascimento = req.body.nascimento;

    if (dataNascimento && dataNascimento.includes('/')) {
      const [dia, mes, ano] = dataNascimento.split('/');
      dataNascimento = `${ano}-${mes}-${dia}`;
    }
    
    req.body.nascimento = new Date(dataNascimento);

    req.body.apartamento = parseInt(req.body.apartamento);

    const moradorAtualizado = await Morador.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!moradorAtualizado) {
      return res.status(404).json({ erro: 'Morador não encontrado' });
    }

    res.json({ mensagem: 'Morador atualizado com sucesso', morador: moradorAtualizado });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const mensagens = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', mensagens });
    }

    if (err.code === 11000) {
      const campo = Object.keys(err.keyValue)[0];
      return res.status(409).json({ erro: `Já existe um morador com esse ${campo}.` });
    }

    console.error('Erro ao atualizar no MongoDB', err);
    res.status(500).json({ erro: 'Erro ao atualizar morador', detalhe: err });
  }
});

// DELETE (remover morador por ID)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const moradorExcluido = await Morador.findByIdAndDelete(id);

    if (!moradorExcluido) {
      return res.status(404).json({ erro: 'Morador não encontrado' });
    }

    res.json({ mensagem: 'Morador excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir no MongoDB', err);
    res.status(500).json({ erro: 'Erro ao excluir morador', detalhe: err });
  }
});


module.exports = router;
