/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import "./App.css";
import Agendamento from "./Agendamento";
import Painel from "./Painel";

function Menu({ onAgendar }){ 
  return (
    <div className="menu">
      <div className="menu--1">
        <img className="logo" src="./assets/images/logo.png" alt="Logo" />
      </div>
      <div className="menu--2">
        <a href="#inicio">Início</a>
        <a href="#servicos">Serviços</a>
      </div>  
      <div className="menu--3">
        <button onClick={onAgendar}>Agendar</button>
      </div>
    </div>
  );
}

function CardServico({ titulo, descricao, preco }) {
  return (
    <div className="card">
      <h3>{titulo}</h3>
      <p>{descricao}</p>
      <span>{preco}</span>
    </div>
  );
}

function Servicos({ onAgendar }) {
  const servicos = [
    { titulo: "Corte Masculino", descricao: "Corte moderno ou clássico feito por profissionais.", preco: "R$40" },
    { titulo: "Barba", descricao: "Modelagem completa e acabamento perfeito.", preco: "R$30" },
    { titulo: "Corte + Barba", descricao: "Combo completo para renovar seu visual.", preco: "R$70" },
  ];
  return (
    <section className="servicos" id="servicos">
      <div className="container">
        <h2>Nossos Serviços</h2>
        <div className="cards">
          {servicos.map((s, i) => <CardServico key={i} {...s} />)}
        </div>
      </div>
    </section>
  );
}

function Sobre({ onAgendar }) {
  return (
    <section className="sobre">
      <div className="container sobre-grid">
        <img src="/barbearia.jpg" alt="Barbearia" style={{ width: '100%', maxWidth: '450px', borderRadius: '10px' }} />
        <div>
          <h2>Sobre a Bigode Cort's</h2>
          <p>Somos especialistas em cortes masculinos e cuidados com a barba. Nosso objetivo é oferecer uma experiência premium para cada cliente.</p>
          <p>Ambiente moderno, profissionais qualificados e atendimento de qualidade.</p>
          <button onClick={onAgendar} className="btn" style={{ cursor: "pointer" }}>Agendar Horário</button>
        </div>
      </div>
    </section>
  );
}

function Galeria() {
  const fotos = ["corte1.jpg", "corte2.jpg", "corte3.jpg", "corte4.jpg"];
  return (
    <section className="galeria">
      <div className="container">
        <h2>Nossos Trabalhos</h2>
        <div className="fotos">
          {fotos.map((foto, i) => <img key={i} src={foto} alt={`Corte ${i + 1}`} />)}
        </div>
      </div>
    </section>
  );
}

function CTA({ onAgendar }) {
  return (
    <section className="cta">
      <div className="container">
        <h2>Pronto para renovar o visual?</h2>
        <p>Agende agora seu horário na Bigode Cort's</p>
        <button onClick={onAgendar} className="btn-agendar" style={{ cursor: "pointer" }}>Agendar Agora</button>
      </div>
    </section>
  );
}

export default function App() {
  const [pagina, setPagina] = useState("home");

  if (pagina === "agendar") return <Agendamento onVoltar={() => { setPagina("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />;
  if (pagina === "painel") return <Painel onVoltar={() => setPagina("home")} />;

  return (
    <>
      <Menu onAgendar={() => setPagina("agendar")} />
      <Servicos />
      <Sobre onAgendar={() => setPagina("agendar")} />
      <Galeria />
      <CTA onAgendar={() => setPagina("agendar")} />
      {/* Link oculto para o painel do barbeiro */}
      <div style={{ textAlign: "center", padding: "10px", background: "#111" }}>
        <small onClick={() => setPagina("painel")} style={{ color: "#333", cursor: "pointer" }}>
          Área do barbeiro
        </small>
      </div>
    </>
  );
}
