// Salvar alunos
function salvarAlunos() {
    localStorage.setItem("alunos", JSON.stringify(alunos));
}

// Carregar alunos salvos
function carregarAlunos() {
    alunos = JSON.parse(localStorage.getItem("alunos")) || [];
}

const STORAGE_KEY = "edunotas_alunos_v1";
let alunos = carregarAlunos();
let alunoSelecionado = null;

const form = document.getElementById("formAluno");
const lista = document.getElementById("listaAlunos");
const painelDetalhes = document.getElementById("painelDetalhes");
const mensagem = document.getElementById("mensagem");

function carregarAlunos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function salvarAlunos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
}
function mediaDo(aluno) {
  return aluno.notas.reduce((soma, nota) => soma + nota, 0) / aluno.notas.length;
}
function formatarNota(valor) {
  return valor.toFixed(1).replace(".", ",");
}
function atualizarPainel() {
  document.getElementById("totalAlunos").textContent = alunos.length;
  document.getElementById("contador").textContent = `${alunos.length} ${alunos.length === 1 ? "aluno" : "alunos"}`;
  if (!alunos.length) {
    document.getElementById("mediaGeral").textContent = "—";
    document.getElementById("totalAprovados").textContent = "0";
  } else {
    const mediaGeral = alunos.reduce((soma, aluno) => soma + mediaDo(aluno), 0) / alunos.length;
    document.getElementById("mediaGeral").textContent = formatarNota(mediaGeral);
    document.getElementById("totalAprovados").textContent = alunos.filter(a => mediaDo(a) >= 7).length;
  }
  renderizarLista();
}
function renderizarLista() {
  if (!alunos.length) {
    lista.innerHTML = '<div class="empty-state"><div>♙</div><strong>Nenhum aluno cadastrado</strong><p>Adicione o primeiro aluno usando o formulário.</p></div>';
    return;
  }
  lista.innerHTML = "";
  alunos.forEach(aluno => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "student-row" + (aluno.id === alunoSelecionado ? " selected" : "");
    const avatar = document.createElement("span");
    avatar.className = "student-avatar";
    avatar.textContent = aluno.nome.trim().charAt(0).toUpperCase();
    const info = document.createElement("span");
    info.className = "student-info";
    const nome = document.createElement("strong");
    nome.textContent = aluno.nome;
    const legenda = document.createElement("small");
    legenda.textContent = "Visualizar notas e resultado";
    info.append(nome, legenda);
    const media = document.createElement("span");
    media.className = "student-average";
    media.textContent = formatarNota(mediaDo(aluno));
    botao.append(avatar, info, media);
    botao.addEventListener("click", () => selecionarAluno(aluno.id));
    lista.appendChild(botao);
  });
}
function selecionarAluno(id) {
  alunoSelecionado = id;
  const aluno = alunos.find(item => item.id === id);
  if (!aluno) return;
  renderizarLista();
  const media = mediaDo(aluno);
  const aprovado = media >= 7;
  painelDetalhes.innerHTML = "";
  const cabecalho = document.createElement("div");
  cabecalho.className = "detail-header";
  const titulo = document.createElement("div");
  const h3 = document.createElement("h3");
  h3.textContent = aluno.nome;
  const p = document.createElement("p");
  p.textContent = "Boletim individual do aluno";
  titulo.append(h3, p);
  const excluir = document.createElement("button");
  excluir.className = "delete-button";
  excluir.textContent = "Excluir aluno";
  excluir.addEventListener("click", () => excluirAluno(aluno.id));
  cabecalho.append(titulo, excluir);
  const resumo = document.createElement("div");
  resumo.className = "grade-summary";
  const itens = [
    ["NOTA 1", formatarNota(aluno.notas[0])],
    ["NOTA 2", formatarNota(aluno.notas[1])],
    ["NOTA 3", formatarNota(aluno.notas[2])],
    ["MÉDIA FINAL", formatarNota(media)]
  ];
  itens.forEach(([rotulo, valor]) => {
    const caixa = document.createElement("div");
    caixa.className = "grade-box";
    const span = document.createElement("span");
    span.textContent = rotulo;
    const strong = document.createElement("strong");
    strong.textContent = valor;
    caixa.append(span, strong);
    resumo.appendChild(caixa);
  });
  const resultado = document.createElement("p");
  resultado.style.margin = "15px 0 0";
  const status = document.createElement("span");
  status.className = "status " + (aprovado ? "aprovado" : "reprovado");
  status.textContent = aprovado ? "Aprovado" : "Reprovado";
  resultado.append("Resultado: ", status);
  painelDetalhes.append(cabecalho, resumo, resultado);
}
function excluirAluno(id) {
  const aluno = alunos.find(item => item.id === id);
  if (!aluno || !confirm(`Deseja realmente excluir ${aluno.nome}?`)) return;
  alunos = alunos.filter(item => item.id !== id);
  if (alunoSelecionado === id) {
    alunoSelecionado = null;
    painelDetalhes.innerHTML = '<div class="details-empty"><span>☝</span><div><strong>Selecione um aluno</strong><p>Clique no nome de um aluno para visualizar suas notas e seu resultado.</p></div></div>';
  }
  salvarAlunos();
  atualizarPainel();
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const notas = [1, 2, 3].map(n => Number(document.getElementById(`nota${n}`).value));
  if (!nome) return;
  if (notas.some(nota => !Number.isFinite(nota) || nota < 0 || nota > 10)) {
    mensagem.textContent = "Digite notas válidas entre 0 e 10.";
    return;
  }
  const aluno = { id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), nome, notas };
  alunos.push(aluno);
  salvarAlunos();
  form.reset();
  mensagem.textContent = "Aluno cadastrado com sucesso!";
  atualizarPainel();
  selecionarAluno(aluno.id);
});
atualizarPainel();
