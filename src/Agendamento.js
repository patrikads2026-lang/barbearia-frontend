import { useState, useEffect } from "react";
import "./Agendamento.css";

const API = "https://barbearia-backend-iiyz.onrender.com";

const servicos = [
  { nome: "Corte Masculino", preco: "R$40", duracao: 30 },
  { nome: "Barba", preco: "R$30", duracao: 20 },
  { nome: "Corte + Barba", preco: "R$70", duracao: 50 },
];
const horarios = ["09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function getProximos7Dias() {
  const dias = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dias.push({
      label: diasSemana[d.getDay()],
      dia: d.getDate(),
      mes: meses[d.getMonth()],
      value: d.toISOString().split("T")[0],
    });
  }
  return dias;
}

export default function Agendamento() {
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState({ servico: "", barbeiro: "", horario: "", data: "", nome: "", telefone: "" });
  const [confirmado, setConfirmado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const dias = getProximos7Dias();

  useEffect(() => {
    fetch(`${API}/api/barbeiros`)
      .then(r => r.json())
      .then(dados => setBarbeiros(dados));
  }, []);

  useEffect(() => {
    if (form.barbeiro && form.data) {
      fetch(`${API}/api/agendamentos`)
        .then(r => r.json())
        .then(dados => {
          const ocupados = dados
            .filter(a => a.barbeiro === form.barbeiro && a.data === form.data && a.status !== "cancelado")
            .map(a => a.horario);
          setHorariosOcupados(ocupados);
        });
    }
  }, [form.barbeiro, form.data]);

  function salvar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  async function confirmar() {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch(`${API}/api/agendamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro || "Erro ao agendar."); setCarregando(false); return; }
      setConfirmado(true);
    } catch {
      setErro("Erro de conexão com o servidor.");
    }
    setCarregando(false);
  }

  if (confirmado) return (
    <div className="ag-wrap">
      <div className="ag-card ag-sucesso">
        <div className="ag-check">✓</div>
        <h2>Agendado com sucesso!</h2>
        <p><strong>{form.nome}</strong>, seu horário foi reservado.</p>
        <div className="ag-resumo">
          <span>✂ {form.servico}</span>
          <span>👤 {form.barbeiro}</span>
          <span>📅 {form.data} às {form.horario}</span>
        </div>
        <button className="ag-btn" onClick={() => { setConfirmado(false); setPasso(1); setForm({ servico:"",barbeiro:"",horario:"",data:"",nome:"",telefone:"" }); }}>
          Novo agendamento
        </button>
      </div>
    </div>
  );

  return (
    <div className="ag-wrap">
      <div className="ag-card">
        <button 
          onClick={() => window.location.href = "/"} 
            style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", marginBottom: "16px", fontSize: "0.9rem" }}>
            ← Voltar ao início
        </button>
        <h1 className="ag-title">Agendar Horário</h1>
        <div className="ag-steps">
          {["Serviço","Barbeiro","Horário","Dados"].map((s, i) => (
            <div key={i} className={`ag-step ${passo > i+1 ? "done" : ""} ${passo === i+1 ? "active" : ""}`}>
              <div className="ag-step-num">{passo > i+1 ? "✓" : i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {passo === 1 && (
          <div className="ag-passo">
            <h2>Escolha o serviço</h2>
            <div className="ag-opcoes">
              {servicos.map(s => (
                <div key={s.nome} className={`ag-opcao ${form.servico === s.nome ? "selected" : ""}`} onClick={() => salvar("servico", s.nome)}>
                  <strong>{s.nome}</strong>
                  <span>{s.preco}</span>
                  <small>{s.duracao} min</small>
                </div>
              ))}
            </div>
            <button className="ag-btn" disabled={!form.servico} onClick={() => setPasso(2)}>Próximo</button>
          </div>
        )}

        {passo === 2 && (
          <div className="ag-passo">
            <h2>Escolha o barbeiro</h2>
            <div className="ag-opcoes">
              {barbeiros.map(b => (
                <div key={b} className={`ag-opcao ag-barbeiro ${form.barbeiro === b ? "selected" : ""}`} onClick={() => salvar("barbeiro", b)}>
                  <div className="ag-avatar">{b[0]}</div>
                  <strong>{b}</strong>
                </div>
              ))}
            </div>
            <div className="ag-nav">
              <button className="ag-btn-back" onClick={() => setPasso(1)}>Voltar</button>
              <button className="ag-btn" disabled={!form.barbeiro} onClick={() => setPasso(3)}>Próximo</button>
            </div>
          </div>
        )}

        {passo === 3 && (
          <div className="ag-passo">
            <h2>Escolha o dia</h2>
            <div className="ag-dias">
              {dias.map(d => (
                <div key={d.value} className={`ag-dia ${form.data === d.value ? "selected" : ""}`} onClick={() => { salvar("data", d.value); salvar("horario", ""); }}>
                  <span className="ag-dia-semana">{d.label}</span>
                  <span className="ag-dia-num">{d.dia}</span>
                  <span className="ag-dia-mes">{d.mes}</span>
                </div>
              ))}
            </div>
            {form.data && (
              <>
                <h2 style={{ marginTop: "24px" }}>Escolha o horário</h2>
                <div className="ag-horarios">
                  {horarios.map(h => {
                    const ocupado = horariosOcupados.includes(h);
                    return (
                      <div key={h} className={`ag-hora ${form.horario === h ? "selected" : ""} ${ocupado ? "ocupado" : ""}`} onClick={() => !ocupado && salvar("horario", h)}>
                        {h}{ocupado && <small>ocupado</small>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div className="ag-nav">
              <button className="ag-btn-back" onClick={() => setPasso(2)}>Voltar</button>
              <button className="ag-btn" disabled={!form.horario || !form.data} onClick={() => setPasso(4)}>Próximo</button>
            </div>
          </div>
        )}

        {passo === 4 && (
          <div className="ag-passo">
            <h2>Seus dados</h2>
            <input className="ag-input" placeholder="Seu nome" value={form.nome} onChange={e => salvar("nome", e.target.value)} />
            <input className="ag-input" placeholder="Telefone (WhatsApp)" value={form.telefone} onChange={e => salvar("telefone", e.target.value)} />
            <div className="ag-resumo-final">
              <p>✂ <strong>{form.servico}</strong></p>
              <p>👤 <strong>{form.barbeiro}</strong></p>
              <p>📅 <strong>{form.data} às {form.horario}</strong></p>
            </div>
            {erro && <p style={{ color: "#ef4444", marginBottom: 12 }}>{erro}</p>}
            <div className="ag-nav">
              <button className="ag-btn-back" onClick={() => setPasso(3)}>Voltar</button>
              <button className="ag-btn" disabled={!form.nome || !form.telefone || carregando} onClick={confirmar}>
                {carregando ? "Aguarde..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}