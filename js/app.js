// URL da API (Relativa para funcionar no Render e Localhost)
const API_URL = '/api';

// Variáveis Globais
let promotores = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarPromotores();
  atualizarDataHoje();
});

// --- Funções Auxiliares ---
function atualizarDataHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  const elInicio = document.getElementById('dataInicio');
  const elFim = document.getElementById('dataFim');
  if (elInicio) elInicio.value = hoje;
  if (elFim) elFim.value = hoje;
}

function mostrarAlerta(msg, tipo = 'info') {
  const div = document.createElement('div');
  // Classes Bootstrap: alert, alert-{tipo}, position-fixed, etc.
  div.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3 shadow`;
  div.style.zIndex = 1055; // Acima de modal
  div.innerHTML = `
        <i class="ri-information-line me-2"></i> ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}


// --- API: Promotores ---

async function carregarPromotores() {
  try {
    const loading = document.getElementById('listaPromotores');
    if (loading) loading.innerHTML = '<div class="alert alert-light text-center"><div class="spinner-border text-primary spinner-border-sm" role="status"></div> Carregando...</div>';

    const res = await fetch(`${API_URL}/promotores`);
    if (!res.ok) throw new Error('Falha na comunicação com o servidor');

    promotores = await res.json();

    renderizarLista();
    atualizarSelect();
  } catch (err) {
    console.error(err);
    mostrarAlerta('Erro ao carregar dados. Verifique se o servidor está rodando.', 'danger');
    document.getElementById('listaPromotores').innerHTML = '<div class="alert alert-danger">Erro de conexão</div>';
  }
}

async function cadastrarPromotor() {
  const nome = document.getElementById('nome').value.trim();
  const marca = document.getElementById('marca').value.trim();
  const cpf = document.getElementById('cpf').value.trim();

  if (!nome || !marca || !cpf) {
    mostrarAlerta('Preencha todos os campos.', 'warning');
    return;
  }

  // Validar CPF (apenas tamanho simples por enquanto)
  if (cpf.length < 11) {
    mostrarAlerta('CPF inválido.', 'warning');
    return;
  }

  try {
    const btn = document.getElementById('btnCadastrar');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';
    btn.disabled = true;

    const res = await fetch(`${API_URL}/promotores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, marca, cpf })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar');

    mostrarAlerta('Promotor cadastrado com sucesso!', 'success');

    // Limpar inputs
    document.getElementById('nome').value = '';
    document.getElementById('marca').value = '';
    document.getElementById('cpf').value = '';

    await carregarPromotores();

  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  } finally {
    const btn = document.getElementById('btnCadastrar');
    btn.innerHTML = '<i class="ri-check-line"></i> Cadastrar';
    btn.disabled = false;
  }
}

// Frontend Search
function filtrarPromotores() {
  const term = document.getElementById('filtroGerenciar').value.toLowerCase();
  const filtrados = promotores.filter(p =>
    p.nome.toLowerCase().includes(term) ||
    p.marca.toLowerCase().includes(term) ||
    p.cpf.includes(term)
  );
  renderizarLista(filtrados);
}

function renderizarLista(lista = promotores) {
  const container = document.getElementById('listaPromotores');
  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<div class="alert alert-secondary text-center">Nenhum promotor encontrado.</div>';
    return;
  }

  lista.forEach(p => {
    // Criar elemento visual usando classes do Bootstrap/Style atual
    const div = document.createElement('div');
    div.className = 'promotor-card d-flex justify-content-between align-items-center p-3 mb-2 bg-body-tertiary border rounded';

    div.innerHTML = `
            <div>
                <h5 class="mb-1 fw-bold text-primary">${p.nome}</h5>
                <div class="text-secondary small">
                    <i class="ri-store-line me-1"></i> ${p.marca} 
                    <span class="badge bg-secondary ms-2">${p.cpf}</span>
                </div>
            </div>
            <div>
                 <button class="btn btn-sm btn-outline-danger" onclick="confirmarExclusaoID('${p._id}')" title="Excluir">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;
    container.appendChild(div);
  });
}

function atualizarSelect() {
  const select = document.getElementById('promotorSelect');
  select.innerHTML = '<option disabled selected>Selecione um promotor...</option>';

  promotores.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p._id; // Mongo ID
    opt.textContent = `${p.nome} - ${p.marca}`;
    select.appendChild(opt);
  });
}


// --- API: Exclusão ---
let idExclusao = null;

function confirmarExclusaoID(id) {
  idExclusao = id;
  if (window.mostrarModal) {
    window.mostrarModal('Tem certeza que deseja remover este promotor permanentemente?');
  } else {
    if (confirm('Excluir permanentemente?')) excluirRealmente();
  }
}

// Essa função é chamada pelo botão "Sim, Excluir" do Modal (no HTML: onclick="confirmarExclusao()")
async function confirmarExclusao() {
  if (!idExclusao) return;
  await excluirRealmente();
  idExclusao = null;
  if (window.fecharModal) window.fecharModal();
}

async function excluirRealmente() {
  try {
    const res = await fetch(`${API_URL}/promotores/${idExclusao}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir');

    mostrarAlerta('Promotor removido.', 'success');
    await carregarPromotores();

  } catch (err) {
    mostrarAlerta('Erro ao excluir registro.', 'danger');
  }
}


// --- API: Registro de Ponto ---

async function registrarPonto(tipo) {
  const id = document.getElementById('promotorSelect').value;

  if (!id || id.startsWith('Selecione')) {
    mostrarAlerta('Por favor, selecione um promotor.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/ponto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promotorId: id, tipo })
    });

    if (!res.ok) throw new Error('Erro ao registrar');

    const label = tipo === 'ENTRADA' ? 'Entrada' : 'Saída';
    mostrarAlerta(`✅ ${label} registrada com sucesso!`, tipo === 'ENTRADA' ? 'success' : 'danger');

  } catch (err) {
    mostrarAlerta('Erro ao registrar ponto.', 'danger');
  }
}

// Conecta com os botões do HTML que chamam essas funções
window.registrarEntrada = () => registrarPonto('ENTRADA');
window.registrarSaida = () => registrarPonto('SAIDA');

// --- Relatórios e PDF (Via HTML Button) ---
// O HTML chama gerarPDF(). O pdf.js define window.criarPDFRelatorio. Nós fazemos a ponte.
window.gerarPDF = async function () {
  const inicio = document.getElementById('dataInicio').value;
  const fim = document.getElementById('dataFim').value;
  const texto = document.getElementById('filtro').value;

  try {
    // Query Params
    const params = new URLSearchParams();
    if (inicio) params.append('dataInicio', inicio);
    if (fim) params.append('dataFim', fim);
    if (texto) params.append('filtroTexto', texto);

    const res = await fetch(`${API_URL}/relatorio?${params.toString()}`);
    if (!res.ok) throw new Error('Erro ao buscar dados');

    const dados = await res.json();

    if (dados.length === 0) {
      mostrarAlerta('Nenhum registro encontrado no período.', 'info');
      return;
    }

    if (window.criarPDFRelatorio) {
      window.criarPDFRelatorio(dados);
    } else {
      alert('Erro: Biblioteca de PDF não carregada.');
    }

  } catch (err) {
    console.error(err);
    mostrarAlerta('Erro ao gerar relatório.', 'danger');
  }
};

// Funções de filtro rápido (mantidas do projeto original, só manipulam valores de input)
window.aplicarFiltroRapido = function (tipo) {
  const dInicio = document.getElementById('dataInicio');
  const dFim = document.getElementById('dataFim');
  const hoje = new Date();

  if (tipo === 'limpar') {
    dInicio.value = '';
    dFim.value = '';
    document.getElementById('filtro').value = '';
    return;
  }

  let dt1 = new Date();
  let dt2 = new Date();

  if (tipo === 'hoje') {
    // já está init com hoje
  } else if (tipo === 'semana') {
    const dia = hoje.getDay();
    dt1.setDate(hoje.getDate() - dia); // Domingo
  } else if (tipo === 'mes') {
    dt1.setDate(1); // dia 1
    dt2 = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0); // Ultimo dia
  }

  dInicio.value = dt1.toISOString().split('T')[0];
  dFim.value = dt2.toISOString().split('T')[0];
};