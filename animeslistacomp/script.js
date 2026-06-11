const SUPABASE_URL = "";
const SUPABASE_KEY = "";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let filtroAtual = "Todos";
let quantidadeVisivel = 6;
const quantidadePorClique = 6;

async function adicionarAnime() {
  const nome = document.getElementById("nomeAnime").value.trim();
  const genero = document.getElementById("generoAnime").value.trim();
  const episodios = Number(document.getElementById("episodiosAnime").value);
  const status = document.getElementById("statusAnime").value;
  const episodiosAssistidos = Number(document.getElementById("episodiosAssistidos").value) || 0;
  const nota = Number(document.getElementById("nota").value) || null;

  if (!nome || !genero || !episodios) {
    alert("Preencha nome, gênero e total de episódios!");
    return;
  }

  if (episodiosAssistidos > episodios) {
    alert("Episódios assistidos não pode ser maior que o total.");
    return;
  }

  if (nota && (nota < 1 || nota > 10)) {
    alert("A nota precisa ser de 1 a 10.");
    return;
  }

  const { error } = await supabaseClient
    .from("animes")
    .insert([
      {
        nome,
        genero,
        episodios,
        episodios_assistidos: episodiosAssistidos,
        nota,
        status
      }
    ]);

  if (error) {
    alert("Erro ao adicionar anime.");
    console.log(error);
    return;
  }

  limparCampos();
  quantidadeVisivel = 6;
  mostrarAnimes();
}

async function mostrarAnimes() {
  const lista = document.getElementById("listaAnimes");
  const busca = document.getElementById("buscaAnime");

  lista.innerHTML = "";

  let consulta = supabaseClient
    .from("animes")
    .select("*")
    .order("id", { ascending: false });

  if (filtroAtual !== "Todos") {
    consulta = consulta.eq("status", filtroAtual);
  }

  const { data, error } = await consulta;

  if (error) {
    lista.innerHTML = "<p>Erro ao carregar animes.</p>";
    console.log(error);
    return;
  }

  atualizarContadores(data);

  let animesFiltrados = data;

  const textoBusca = busca ? busca.value.toLowerCase().trim() : "";

  if (textoBusca) {
    animesFiltrados = animesFiltrados.filter(anime =>
      anime.nome.toLowerCase().includes(textoBusca)
    );
  }

  if (animesFiltrados.length === 0) {
    lista.innerHTML = "<p>Nenhum anime encontrado.</p>";

    const btn = document.getElementById("btnExibirMais");
    if (btn) btn.style.display = "none";

    return;
  }

  const animesParaMostrar = animesFiltrados.slice(0, quantidadeVisivel);

  animesParaMostrar.forEach(anime => {
    const card = document.createElement("div");
    card.classList.add("card");

    const assistidos = Number(anime.episodios_assistidos) || 0;
    const total = Number(anime.episodios) || 0;

    let progresso = total > 0 ? Math.round((assistidos / total) * 100) : 0;
    if (progresso > 100) progresso = 100;

    card.innerHTML = `
      <h2>${anime.nome}</h2>

      <p><strong>Gênero:</strong> ${anime.genero}</p>

      <p class="nota">
        ⭐ Nota: ${anime.nota ? anime.nota + "/10" : "Sem nota"}
      </p>

      <p>
        <strong>Episódios:</strong> ${assistidos} / ${total}
      </p>

      <div class="progresso">
        <div class="barra" style="width: ${progresso}%"></div>
      </div>

      <p>${progresso}% concluído</p>

      <p><strong>Status:</strong> ${anime.status}</p>

      <div class="controle-episodios">
        <button onclick="diminuirEpisodio(${anime.id}, ${assistidos})">-</button>
        <span>${assistidos} / ${total}</span>
        <button onclick="aumentarEpisodio(${anime.id}, ${assistidos}, ${total})">+</button>
      </div>

      <div class="acoes">
        <button onclick="alterarStatus(${anime.id}, 'Quero assistir')">
          Quero assistir
        </button>

        <button onclick="alterarStatus(${anime.id}, 'Assistindo')">
          Assistindo
        </button>

        <button onclick="alterarStatus(${anime.id}, 'Assistido')">
          Assistido
        </button>

        <button onclick="editarNota(${anime.id}, ${anime.nota || 0})">
          Editar Nota
        </button>

        <button onclick="editarEpisodios(${anime.id}, ${assistidos}, ${total})">
          Editar Episódios
        </button>

        <button class="excluir" onclick="excluirAnime(${anime.id})">
          Excluir
        </button>
      </div>
    `;

    lista.appendChild(card);
  });

  const btn = document.getElementById("btnExibirMais");

  if (btn) {
    btn.style.display =
      quantidadeVisivel >= animesFiltrados.length ? "none" : "block";
  }
}

async function aumentarEpisodio(id, atual, total) {
  if (atual >= total) return;

  const novoValor = atual + 1;
  const novoStatus = novoValor >= total ? "Assistido" : "Assistindo";

  const { error } = await supabaseClient
    .from("animes")
    .update({
      episodios_assistidos: novoValor,
      status: novoStatus
    })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar episódio.");
    console.log(error);
    return;
  }

  mostrarAnimes();
}

async function diminuirEpisodio(id, atual) {
  if (atual <= 0) return;

  const novoValor = atual - 1;
  const novoStatus = novoValor === 0 ? "Quero assistir" : "Assistindo";

  const { error } = await supabaseClient
    .from("animes")
    .update({
      episodios_assistidos: novoValor,
      status: novoStatus
    })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar episódio.");
    console.log(error);
    return;
  }

  mostrarAnimes();
}

function exibirMais() {
  quantidadeVisivel += quantidadePorClique;
  mostrarAnimes();
}

async function alterarStatus(id, novoStatus) {
  const { error } = await supabaseClient
    .from("animes")
    .update({ status: novoStatus })
    .eq("id", id);

  if (error) {
    alert("Erro ao alterar status.");
    console.log(error);
    return;
  }

  mostrarAnimes();
}

async function excluirAnime(id) {
  if (!confirm("Deseja realmente excluir este anime?")) {
    return;
  }

  const { error } = await supabaseClient
    .from("animes")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir anime.");
    console.log(error);
    return;
  }

  mostrarAnimes();
}

function filtrarAnimes(status) {
  filtroAtual = status;
  quantidadeVisivel = 6;
  mostrarAnimes();
}

function limparCampos() {
  document.getElementById("nomeAnime").value = "";
  document.getElementById("generoAnime").value = "";
  document.getElementById("episodiosAnime").value = "";
  document.getElementById("episodiosAssistidos").value = "";
  document.getElementById("nota").value = "";
  document.getElementById("statusAnime").value = "Quero assistir";
}

function atualizarContadores(animes) {
  const total = animes.length;

  const queroAssistir = animes.filter(anime =>
    anime.status === "Quero assistir"
  ).length;

  const assistindo = animes.filter(anime =>
    anime.status === "Assistindo"
  ).length;

  const assistido = animes.filter(anime =>
    anime.status === "Assistido"
  ).length;

  document.getElementById("contadorTotal").textContent = total;
  document.getElementById("contadorQuero").textContent = queroAssistir;
  document.getElementById("contadorAssistindo").textContent = assistindo;
  document.getElementById("contadorAssistido").textContent = assistido;
}

mostrarAnimes();

async function editarNota(id, notaAtual) {

  const novaNota = prompt(
    "Digite uma nota de 1 a 10:",
    notaAtual
  );

  if (novaNota === null) return;

  const nota = Number(novaNota);

  if (isNaN(nota) || nota < 1 || nota > 10) {
    alert("Digite uma nota válida entre 1 e 10.");
    return;
  }

  const { error } = await supabaseClient
    .from("animes")
    .update({
      nota: nota
    })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar nota.");
    console.log(error);
    return;
  }

  mostrarAnimes();
}

async function editarEpisodios(id, atual, total) {

  const novoValor = prompt(
    `Digite quantos episódios você assistiu (0 a ${total}):`,
    atual
  );

  if (novoValor === null) return;

  const assistidos = Number(novoValor);

  if (
    isNaN(assistidos) ||
    assistidos < 0 ||
    assistidos > total
  ) {
    alert(`Digite um valor entre 0 e ${total}.`);
    return;
  }

  let novoStatus = "Quero assistir";

  if (assistidos > 0) {
    novoStatus = "Assistindo";
  }

  if (assistidos >= total) {
    novoStatus = "Assistido";
  }

  const { error } = await supabaseClient
    .from("animes")
    .update({
      episodios_assistidos: assistidos,
      status: novoStatus
    })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar episódios.");
    console.log(error);
    return;
  }

  mostrarAnimes();
}
