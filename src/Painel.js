import { useState, useEffect } from "react";
import "./Painel.css";

const API = "https://barbearia-backend-iiyz.onrender.com";
const SENHA = "barbearia123";

export default function Painel() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [aba, setAba] = useState("hoje");
  const [bloqueios, setBloqueios] = useState([]);
  const [novoBloqueio, setNovoBloqueio] = useState({ data: "", hora: "" });
  const [barbeiros, setBarbeiros] = useState(() => {
    const salvo = localStorage.getItem("barbeiros");
   const [barbeiros, setBarbeiros] = useState(["Carlos", "Thiago", "Adriano"]);
  const [novoBarbeiro, setNovoBarbeiro] = useState("");
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");

  useEffect(() => {
    if (logado) { buscarAgendamentos(); buscarBloqueios(); }
  }, [logado]);

  useEffect(() => {
   // localStorage.setItem("barbeiros", JSON.stringify(barbeiros)); 
  }, [barbeiros]);

  async function buscarAgendamentos() {
    const res = await fetch(${API}/api/agendamentos);
    const dados = await res.json();
    setAgendamentos(dados);
  }

  async function buscarBloqueios() {
    const res = await fetch(${API}/api/bloqueios);
    const dados = await res.json();
    setBloqueios(dados);
  }

  function login() {
    if (senha === SENHA) { setLogado(true); setErro(""); }
    else setErro("Senha incorreta!");
  }

  async function mudarStatus(id, status) {
    await fetch(${API}/api/agendamentos/${id}, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    buscarAgendamentos();
  }

  async function adicionarBloqueio() {
    if (!novoBloqueio.data || !novoBloqueio.hora) return;
    await fetch(${API}/api/bloqueios, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoBloqueio),
    });
    setNovoBloqueio({ data: "", hora: "" });
    buscarBloqueios();
  }

  async function removerBloqueio(id) {
    await fetch(${API}/api/bloqueios/${id}, { method: "DELETE" });
    buscarBloqueios();
  }

  function adicionarBarbeiro() {
    if (!novoBarbeiro.trim()) return;
    setBarbeiros(prev => [...prev, novoBarbeiro.trim()]);
    setNovoBarbeiro("");
  }

  function removerBarbeiro(nome) {
    setBarbeiros(prev => prev.filter(b => b !== nome));
  }

  function salvarEdicao(nomeAntigo) {
    if (!nomeEditado.trim()) return;
    setBarbeiros(prev => prev.map(b => b === nomeAntigo ? nomeEditado.trim() : b));
    setEditando(null);
    setNomeEditado("");
  }

  const hoje = new Date().toISOString().split("T")[0];
  const agHoje = agendamentos.filter(a => a.data === hoje);
  const agTodos = [...agendamentos].sort((a, b) => new Date(b.data) - new Date(a.data));
  const statusCor = { pendente: "#f59e0b", confirmado: "#10b981", cancelado: "#ef4444" };

  if (!logado) return (
    <div className="painel-wrap">
      <div className="painel-login">
        <h1>🔐 Painel do Barbeiro</h1>
        <p>Acesso restrito</p>
        <input className="painel-input" type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        {erro && <p className="painel-erro">{erro}</p>}
        <button className="painel-btn" onClick={login}>Entrar</button>
      </div>
    </div>
  );

  return (
    <div className="painel-wrap">
      <div className="painel-container">
        <div className="painel-header">
          <h1>✂ Painel do Barbeiro</h1>
          <button className="painel-sair" onClick={() => setLogado(false)}>Sair</button>
        </div>
        <div className="painel-stats">
          <div className="stat"><span>{agHoje.length}</span><p>Hoje</p></div>
          <div className="stat"><span>{agendamentos.filter(a => a.status === "pendente").length}</span><p>Pendentes</p></div>
          <div className="stat"><span>{agendamentos.filter(a => a.status === "confirmado").length}</span><p>Confirmados</p></div>
          <div className="stat"><span>{agendamentos.length}</span><p>Total</p></div>
        </div>
        <div className="painel-abas">
          {["hoje", "historico", "bloquear", "barbeiros"].map(a => (
            <button key={a} className={painel-aba ${aba === a ? "active" : ""}} onClick={() => setAba(a)}>
              {a === "hoje" ? "📅 Hoje" : a === "historico" ? "📋 Histórico" : a === "bloquear" ? "🚫 Bloquear" : "💈 Barbeiros"}
            </button>
          ))}
        </div>

        {aba === "hoje" && (
          <div className="painel-lista">
            {agHoje.length === 0 ? <p className="painel-vazio">Nenhum agendamento para hoje.</p> : agHoje.map(a => (
              <div key={a.id} className="painel-item">
                <div className="painel-item-info">
                  <strong>{a.nome}</strong>
                  <span>{a.horario} — {a.servico} c/ {a.barbeiro}</span>
                  <small>📱 {a.telefone}</small>
                </div>
                <div className="painel-item-acoes">
                  <span className="painel-status" style={{ background: statusCor[a.status] }}>{a.status}</span>
                  {a.status === "pendente" && <>
                    <button className="btn-confirmar" onClick={() => mudarStatus(a.id, "confirmado")}>✓</button>
                    <button className="btn-cancelar" onClick={() => mudarStatus(a.id, "cancelado")}>✗</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}

        {aba === "historico" && (
          <div className="painel-lista">
            {agTodos.length === 0 ? <p className="painel-vazio">Nenhum agendamento ainda.</p> : agTodos.map(a => (
              <div key={a.id} className="painel-item">
                <div className="painel-item-info">
                  <strong>{a.nome}</strong>
                  <span>{a.data} às {a.horario} — {a.servico} c/ {a.barbeiro}</span>
                  <small>📱 {a.telefone}</small>
                </div>
                <div className="painel-item-acoes">
                  <span className="painel-status" style={{ background: statusCor[a.status] }}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {aba === "bloquear" && (
          <div>
            <div className="painel-bloquear-form">
              <input className="painel-input" type="date" value={novoBloqueio.data} onChange={e => setNovoBloqueio(p => ({ ...p, data: e.target.value }))} />
              <input className="painel-input" type="time" value={novoBloqueio.hora} onChange={e => setNovoBloqueio(p => ({ ...p, hora: e.target.value }))} />
              <button className="painel-btn" onClick={adicionarBloqueio}>Bloquear</button>
            </div>
            <div className="painel-lista">
              {bloqueios.length === 0 ? <p className="painel-vazio">Nenhum horário bloqueado.</p> : bloqueios.map(b => (
                <div key={b.id} className="painel-item">
                  <span>🚫 {b.data} às {b.hora}</span>
                  <button className="btn-cancelar" onClick={() => removerBloqueio(b.id)}>✗</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === "barbeiros" && (
          <div>
            <div className="painel-bloquear-form">
              <input className="painel-input" placeholder="Nome do novo barbeiro" value={novoBarbeiro} onChange={e => setNovoBarbeiro(e.target.value)} />
              <button className="painel-btn" onClick={adicionarBarbeiro}>Adicionar</button>
            </div>
            <div className="painel-lista">
              {barbeiros.map(b => (
                <div key={b} className="painel-item">
                  {editando === b ? (
                    <>
                      <input className="painel-input" value={nomeEditado} onChange={e => setNomeEditado(e.target.value)} />
                      <button className="btn-confirmar" onClick={() => salvarEdicao(b)}>✓</button>
                      <button className="btn-cancelar" onClick={() => setEditando(null)}>✗</button>
                    </>
                  ) : (
                    <>
                      <span>💈 {b}</span>
                      <div className="painel-item-acoes">
                        <button className="btn-confirmar" onClick={() => { setEditando(b); setNomeEditado(b); }}>✏️</button>
                        <button className="btn-cancelar" onClick={() => removerBarbeiro(b)}>✗</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
