# Controle de Promotores 🚀

Sistema web Fullstack para gestão de promotores e controle de ponto, desenvolvido com **Node.js**, **MongoDB** e uma interface moderna com **Bootstrap 5**.

![Badge status](https://img.shields.io/badge/STATUS-FINALIZADO-green)
![NodeJS](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white)

## 📋 Funcionalidades

*   **Gestão de Promotores**: Cadastro, listagem e remoção de promotores.
*   **Controle de Ponto**: Registro de Entrada e Saída com data e hora automáticas.
*   **Relatórios em PDF**:
    *   **Lista de Promotores**: Design moderno (Dark/Blue) com indicadores da última movimentação.
    *   **Relatório de Ponto**: Histórico filtrado por data e nome, com status colorido (Verde/Vermelho).
*   **Interface Moderna**:
    *   Design responsivo com Bootstrap 5.
    *   **Dark Mode** nativo.
    *   Lista de promotores com scroll infinito customizado.
    *   Rodapé com **Marcas D'água 3D Animadas** (NanDev & CrisDev).

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: HTML5, CSS3 (Custom + Bootstrap), JavaScript (ES6+), jsPDF.
*   **Backend**: Node.js, Express.js.
*   **Banco de Dados**: MongoDB Atlas (Mongoose ODM).
*   **Hospedagem**: Render (Compatível também com Vercel).

## ⚙️ Como Rodar Localmente

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/Nansinyx26/adm_promotores.git
    cd adm_promotores
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados**:
    *   Crie um arquivo `.env` na raiz do projeto.
    *   Adicione sua string de conexão do MongoDB:
        ```env
        MONGO_URI=sua_string_de_conexao_mongodb_atlas_aqui
        PORT=3000
        ```

4.  **Inicie o Servidor**:
    ```bash
    node server.js
    ```

5.  **Acesse o projeto**:
    Abra seu navegador em `http://localhost:3000`

## ☁️ Como Fazer Deploy (Render)

1.  Crie uma conta no [Render](https://render.com).
2.  Crie um novo **Web Service**.
3.  Conecte este repositório do GitHub.
4.  Nas configurações:
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  Em **Environment Variables**, adicione:
    *   `MONGO_URI`: (Sua conexão do MongoDB conforme o .env)

## ✒️ Autores

*   **Renan de Oliveira (NanDev)** - [Portfólio](https://nansinyx26.github.io/Portifolio-2026-Renan-Farias/)
*   **Cristiane Ferreira (CrisDev)** - [Portfólio](https://crisfs2001.github.io/Portf-lio_Cristiane_Ferreira_2026/)

---
Desenvolvido com ❤️ e JavaScript.
