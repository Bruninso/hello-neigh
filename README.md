# Hello Neigh

Este repositório contém a nova versão de um sistema de gestão para condomínios, com foco em melhorias estruturais e organizacionais em relação à versão anterior: [hello-neigh (versão original)](https://github.com/aliensvs/hello-neigh).

## Objetivo

Desenvolver uma aplicação web para facilitar a administração de um condomínio, incluindo funcionalidades como:

- Cadastro de moradores
- Registro de ocorrências, como encomendas, visitas, etc.
- Reservas de áreas comuns
- Comunicação interna entre moradores e administração

## Melhorias em relação à versão anterior

- Reorganização do código-fonte
- Adição de novas funcionalidades
- Melhor documentação e estrutura de pastas
- Implementação do banco de dados

## Tecnologias utilizadas

- HTML / CSS / JavaScript
- Node.js (backend com Express)
- MongoDB (armazenamento de dados)
- Mongoose (ORM)
- WebGL (Representações graficas)

Como rodar o projeto

1. Clone o repositório
```
git clone https://github.com/Bruniso/hello-neigh.git
cd hello-neigh
```
2. Instale as dependências do backend
```
npm install
```
3. Inicie o MongoDB

Certifique-se de que o MongoDB está rodando localmente na porta 27017. Caso não esteja, execute:
```
mongod
```
Ou configure outro diretório com --dbpath se necessário.

4. Inicie o servidor Express
```
node server.js
```
Se tudo estiver certo, você verá:
```
Conectado ao MongoDB
```
Servidor rodando na porta 3000

5. Acesse a interface

Abra o arquivo HTML no navegador (ex: form-morador.html) para usar o sistema de cadastro.
