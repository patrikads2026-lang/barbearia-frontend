import { useState, useEffect } from "react";
import "./Painel.css";

const API = "https://barbearia-backend-iiyz.onrender.com";
const HORARIOS = ["09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];

export default function Painel() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [aba, setAba] = useState("agenda");
  const [bloqueios, setBloqueios] = useState([]);
  const [novoBloqueio, setNovoBloqueio] = useState({ data: "", hora: "" });
  const [barbeiros, setBarbeiros] = useState([]);
  const [novoBarbeiro, setNovoBarbeiro] = useState({ nome: "", senha: "" });
  const [editando, setEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [senhaEditada, setSenhaEditada] = useState("");
  const [dataAgenda, setDataAgenda] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (usuario) {
      buscarAgendamentos();
      buscarBloqueios();
      if (usuario.tipo === "admin") buscarBarbeiros();
    }
  }, [usuario]);

  async function buscarAgendamentos() {
    const res = await fetch(`${API}/api/agendamentos`);
    const dados = await res.json();
    setAgendamentos(dados);
  }

  async function buscarBloqueios() {
    const res = await fetch(`${API}/api/bloqueios`);
    const dados = await res.json();
    setBloqueios(dados);
  }

  async function buscarBarbeiros() {
    const res = await fetch(`${API}/api/barbeiros`);
    const dados = await res.json();
    setBarbeiros(dados);
  }

  async function login() {
    setErro("");
    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha }),
    });
    const data = await res.json();
    if (!res.ok) { setErro(data.erro); return; }
    setUsuario(data);
  }

  async function mudarStatus(id, status) {
    await fetch(`${API}/api/agendamentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    buscarAgendamentos();
  }

  async function adicionarBloqueio() {
    if (!novoBloqueio.data || !novoBloqueio.hora) return;
    await fetch(`${API}/api/bloqueios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoBloqueio),
    });
    setNovoBloqueio({ data: "", hora: "" });
    buscarBloqueios();
  }

  async function removerBloqueio(id) {
    await fetch(`${API}/api/bloqueios/${id}`, { method: "DELETE" });
    buscarBloqueios();
  }

  async function adicionarBarbeiro() {
    if (!novoBarbeiro.nome.trim() || !novoBarbeiro.senha.trim()) return;
    await fetch(`${API}/api/barbeiros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoBarbeiro),
    });
    setNovoBarbeiro({ nome: "", senha: "" });
    buscarBarbeiros();
  }

  async function removerBarbeiro(nome) {
    await fetch(`${API}/api/barbeiros/${encodeURIComponent(nome)}`, { method: "DELETE" });
    buscarBarbeiros();
  }

  async function salvarEdicao(nomeAntigo) {
    if (!nomeEditado.trim()) return;
    await fetch(`${API}/api/barbeiros`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomeAntigo, nomeNovo: nomeEditado.trim(), senha: senhaEditada }),
    });
    setEditando(null);
    setNomeEditado("");
    setSenhaEditada("");
    buscarBarbeiros();
  }

  const hoje = new Date().toISOString().split("T")[0];
  const agFiltrados = usuario?.tipo === "barbeiro"
    ? agendamentos.filter(a => a.barbeiro === usuario.nome)
    : agendamentos;
  const agHoje = agFiltrados.filter(a => a.data === hoje);
  const agTodos = [...agFiltrados].sort((a, b) => new Date(b.data) - new Date(a.data));
  const statusCor = { pendente: "#f59e0b", confirmado: "#10b981", cancelado: "#ef4444" };

  // Agenda visual
  const agDia = agFiltrados.filter(a => a.data === dataAgenda && a.status !== "cancelado");
  const bloqueiosDia = bloqueios.filter(b => b.data === dataAgenda);

  if (!usuario) return (
    <div className="painel-wrap">
      <div className="painel-login">
        <h1>🔐 Painel do Barbeiro</h1>
        <p>Acesso restrito</p>
        <input className="painel-input" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
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
          <div>
            <h1>✂ {usuario.tipo === "admin" ? "Painel Admin" : `Olá, ${usuario.nome}`}</h1>
            <small style={{ color: "#666" }}>{usuario.tipo === "admin" ? "Acesso total" : "Seus agendamentos"}</small>
          </div>
          <button className="painel-sair" onClick={() => setUsuario(null)}>Sair</button>
        </div>

        <div className="painel-stats">
          <div className="stat"><span>{agHoje.length}</span><p>Hoje</p></div>
          <div className="stat"><span>{agFiltrados.filter(a => a.status === "pendente").length}</span><p>Pendentes</p></div>
          <div className="stat"><span>{agFiltrados.filter(a => a.status === "confirmado").length}</span><p>Confirmados</p></div>
          <div className="stat"><span>{agFiltrados.length}</span><p>Total</p></div>
        </div>

        <div className="painel-abas">
          {["agenda", "historico", ...(usuario.tipo === "admin" ? ["bloquear", "barbeiros"] : [])].map(a => (
            <button key={a} className={`painel-aba ${aba === a ? "active" : ""}`} onClick={() => setAba(a)}>
              {a === "agenda" ? "📅 Agenda" : a === "historico" ? "📋 Histórico" : a === "bloquear" ? "🚫 Bloquear" : "✂ Barbeiros"}
            </button>
          ))}
        </div>

        {/* AGENDA VISUAL */}
        {aba === "agenda" && (
          <div className="ag-passo">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <h2 style={{ color: "#fff", margin: 0 }}>Grade do dia</h2>
              <input
                type="date"
                className="painel-input"
                style={{ width: "auto", marginBottom: 0 }}
                value={dataAgenda}
                onChange={e => setDataAgenda(e.target.value)}
              />
            </div>
            <div className="agenda-grade">
              {HORARIOS.map(h => {
                const ag = agDia.find(a => a.horario === h);
                const bloqueado = bloqueiosDia.find(b => b.hora === h);
                const livre = !ag && !bloqueado;
                return (
                  <div key={h} className={`agenda-slot ${ag ? "ocupado" : bloqueado ? "bloqueado" : "livre"}`}>
                    <span className="agenda-hora">{h}</span>
                    {ag && (
                      <div className="agenda-info">
                        <strong>{ag.nome}</strong>
                        <span>{ag.servico}</span>
                        <span style={{ color: statusCor[ag.status], fontSize: "0.75rem" }}>{ag.status}</span>
                        {ag.status === "pendente" && (
                          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                            <button className="btn-confirmar" style={{ fontSize: "0.75rem", padding: "2px 8px" }} onClick={() => mudarStatus(ag.id, "confirmado")}>✓</button>
                            <button className="btn-cancelar" style={{ fontSize: "0.75rem", padding: "2px 8px" }} onClick={() => mudarStatus(ag.id, "cancelado")}>✗</button>
                          </div>
                        )}
                      </div>
                    )}
                    {bloqueado && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>Bloqueado</span>}
                    {livre && <span style={{ color: "#10b981", fontSize: "0.8rem" }}>Disponível</span>}
                  </div>
                );
              })}
            </div>
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
                  {a.status === "pendente" && <>
                    <button className="btn-confirmar" onClick={() => mudarStatus(a.id, "confirmado")}>✓</button>
                    <button className="btn-cancelar" onClick={() => mudarStatus(a.id, "cancelado")}>✗</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}

        {aba === "bloquear" && usuario.tipo === "admin" && (
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

        {aba === "barbeiros" && usuario.tipo === "admin" && (
          <div>
            <div className="painel-bloquear-form" style={{ flexWrap: "wrap" }}>
              <input className="painel-input" placeholder="Nome do barbeiro" value={novoBarbeiro.nome} onChange={e => setNovoBarbeiro(p => ({ ...p, nome: e.target.value }))} />
              <input className="painel-input" type="password" placeholder="Senha do barbeiro" value={novoBarbeiro.senha} onChange={e => setNovoBarbeiro(p => ({ ...p, senha: e.target.value }))} />
              <button className="painel-btn" onClick={adicionarBarbeiro}>Adicionar</button>
            </div>
            <div className="painel-lista">
              {barbeiros.length === 0 ? <p className="painel-vazio">Nenhum barbeiro cadastrado.</p> : barbeiros.map(b => (
                <div key={b} className="painel-item">
                  {editando === b ? (
                    <>
                      <input className="painel-input" placeholder="Novo nome" value={nomeEditado} onChange={e => setNomeEditado(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
                      <input className="painel-input" type="password" placeholder="Nova senha" value={senhaEditada} onChange={e => setSenhaEditada(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
                      <button className="btn-confirmar" onClick={() => salvarEdicao(b)}>✓</button>
                      <button className="btn-cancelar" onClick={() => setEditando(null)}>✗</button>
                    </>
                  ) : (
                    <>
                      <div className="painel-item-info"><strong>✂ {b}</strong></div>
                      <div className="painel-item-acoes">
                        <button className="btn-confirmar" onClick={() => { setEditando(b); setNomeEditado(b); }}>✏ Editar</button>
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
