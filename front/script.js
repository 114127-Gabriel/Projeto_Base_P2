
const API_URL = "http://localhost:5224/api/Atividades";

// Elementos da página
const areaConteudo = document.getElementById("areaConteudo");
const mensagem = document.getElementById("mensagem");
const carregando = document.getElementById("carregando");

const formAtividade = document.getElementById("formAtividade");
const tipo = document.getElementById("tipo");
const titulo = document.getElementById("titulo");
const ano = document.getElementById("ano");

const camposCurso = document.getElementById("camposCurso");
const camposWorkshop = document.getElementById("camposWorkshop");

const professor = document.getElementById("professor");
const cargaHoraria = document.getElementById("cargaHoraria");
const vagas = document.getElementById("vagas");

const instrutor = document.getElementById("instrutor");
const local = document.getElementById("local");
const duracaoHoras = document.getElementById("duracaoHoras");

const botaoSalvar = document.getElementById("botaoSalvar");
const botaoCancelar = document.getElementById("botaoCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

// Guarda a atividade que está sendo editada.
// Se for null, significa que estamos cadastrando uma nova atividade.
let atividadeEmEdicao = null;


// MOSTRAR MENSAGENS NA TELA
function mostrarMensagem(texto, tipoMensagem) {
    mensagem.textContent = texto;
    mensagem.className = `alert alert-${tipoMensagem}`;
}


// MOSTRAR OS CAMPOS DE ACORDO COM O TIPO ESCOLHIDO
tipo.addEventListener("change", () => {
    camposCurso.classList.add("d-none");
    camposWorkshop.classList.add("d-none");

    if (tipo.value === "curso") {
        camposCurso.classList.remove("d-none");
    }

    if (tipo.value === "workshop") {
        camposWorkshop.classList.remove("d-none");
    }
});


// CARREGAR ATIVIDADES DA API (GET)
function carregarAtividades() {
    carregando.classList.remove("d-none");
    mensagem.classList.add("d-none");

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Não foi possível carregar as atividades.");
            }

            return response.json();
        })
        .then(atividades => {
            exibirAtividades(atividades);
        })
        .catch(erro => {
            console.error(erro);
            mostrarMensagem(erro.message, "danger");
        })
        .finally(() => {
            carregando.classList.add("d-none");
        });
}


// EXIBIR AS ATIVIDADES NA TELA
function exibirAtividades(atividades) {
    areaConteudo.innerHTML = "";

    if (!atividades || atividades.length === 0) {
        areaConteudo.innerHTML = `
            <div class="col-12">
                <div class="alert alert-secondary">
                    Nenhuma atividade cadastrada.
                </div>
            </div>
        `;
        return;
    }

    atividades.forEach(atividade => {

        // Identifica se é curso ou workshop
        const ehCurso = atividade.professor !== undefined;

        const tipoAtividade = ehCurso ? "Curso" : "Workshop";

        const responsavel = ehCurso
            ? atividade.professor
            : atividade.instrutor;

        const detalheEspecifico = ehCurso
            ? `Carga horária: ${atividade.cargaHoraria} horas<br>
               Vagas: ${atividade.vagas}`
            : `Local: ${atividade.local}<br>
               Duração: ${atividade.duracaoHoras} horas`;

        // Cria a coluna do Bootstrap
        const coluna = document.createElement("div");
        coluna.className = "col";

        // Cria o cartão
        const card = document.createElement("div");
        card.className = "card card-atividade";

        const corpo = document.createElement("div");
        corpo.className = "card-body";

        const tituloCard = document.createElement("h5");
        tituloCard.className = "card-title";
        tituloCard.textContent = atividade.titulo;

        const tipoCard = document.createElement("span");
        tipoCard.className = "badge bg-primary mb-3";
        tipoCard.textContent = tipoAtividade;

        const anoCard = document.createElement("p");
        anoCard.className = "text-secondary mb-2";
        anoCard.textContent = `Ano: ${atividade.ano}`;

        const responsavelCard = document.createElement("p");
        responsavelCard.textContent =
            `${ehCurso ? "Professor" : "Instrutor"}: ${responsavel}`;

        const detalhesCard = document.createElement("p");
        detalhesCard.innerHTML = detalheEspecifico;

        // Botão de detalhes
        const botaoDetalhes = document.createElement("button");
        botaoDetalhes.className = "btn btn-outline-primary btn-sm";
        botaoDetalhes.textContent = "Detalhes";

        botaoDetalhes.addEventListener("click", () => {
            alert(
                `${tipoAtividade}\n` +
                `Título: ${atividade.titulo}\n` +
                `Ano: ${atividade.ano}\n` +
                `${ehCurso
                    ? `Professor: ${atividade.professor}\nCarga horária: ${atividade.cargaHoraria}\nVagas: ${atividade.vagas}`
                    : `Instrutor: ${atividade.instrutor}\nLocal: ${atividade.local}\nDuração: ${atividade.duracaoHoras} horas`}`
            );
        });

        // Botão de editar
        const botaoEditar = document.createElement("button");
        botaoEditar.className = "btn btn-warning btn-sm";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", () => {
            prepararEdicao(atividade);
        });

        // Botão de excluir
        const botaoExcluir = document.createElement("button");
        botaoExcluir.className = "btn btn-danger btn-sm";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", () => {
            excluirAtividade(atividade.id);
        });

        // Organiza os elementos do cartão
        const botoes = document.createElement("div");
        botoes.className = "d-flex flex-wrap gap-2 mt-3";

        botoes.append(botaoDetalhes, botaoEditar, botaoExcluir);

        corpo.append(
            tituloCard,
            tipoCard,
            anoCard,
            responsavelCard,
            detalhesCard,
            botoes
        );

        card.appendChild(corpo);
        coluna.appendChild(card);
        areaConteudo.appendChild(coluna);
    });
}


// VALIDAR OS CAMPOS ESPECÍFICOS
function validarCampos() {
    if (tipo.value === "") {
        mostrarMensagem("Selecione o tipo da atividade.", "warning");
        tipo.focus();
        return false;
    }

    if (titulo.value.trim() === "") {
        mostrarMensagem("Informe o título da atividade.", "warning");
        titulo.focus();
        return false;
    }

    if (ano.value === "" || Number(ano.value) < 0) {
        mostrarMensagem("Informe um ano válido.", "warning");
        ano.focus();
        return false;
    }

    if (tipo.value === "curso") {
        if (professor.value.trim() === "") {
            mostrarMensagem("Informe o nome do professor.", "warning");
            professor.focus();
            return false;
        }

        if (Number(cargaHoraria.value) <= 0 || cargaHoraria.value === "") {
            mostrarMensagem("A carga horária deve ser maior que zero.", "warning");
            cargaHoraria.focus();
            return false;
        }

        if (Number(vagas.value) <= 0 || vagas.value === "") {
            mostrarMensagem("O número de vagas deve ser maior que zero.", "warning");
            vagas.focus();
            return false;
        }
    }

    if (tipo.value === "workshop") {
        if (instrutor.value.trim() === "") {
            mostrarMensagem("Informe o nome do instrutor.", "warning");
            instrutor.focus();
            return false;
        }

        if (local.value.trim() === "") {
            mostrarMensagem("Informe o local do workshop.", "warning");
            local.focus();
            return false;
        }

        if (Number(duracaoHoras.value) <= 0 || duracaoHoras.value === "") {
            mostrarMensagem("A duração deve ser maior que zero.", "warning");
            duracaoHoras.focus();
            return false;
        }
    }

    return true;
}


// CADASTRAR OU EDITAR ATIVIDADE (POST / PUT)
formAtividade.addEventListener("submit", event => {
    event.preventDefault();

    if (!validarCampos()) {
        return;
    }

    const tipoAtividade = tipo.value;

    // Monta os dados conforme o tipo escolhido
    let dados = {
        titulo: titulo.value.trim(),
        ano: Number(ano.value)
    };

    if (tipoAtividade === "curso") {
        dados.professor = professor.value.trim();
        dados.cargaHoraria = Number(cargaHoraria.value);
        dados.vagas = Number(vagas.value);
    } else {
        dados.instrutor = instrutor.value.trim();
        dados.local = local.value.trim();
        dados.duracaoHoras = Number(duracaoHoras.value);
    }

    // Decide se será POST ou PUT
    const editando = atividadeEmEdicao !== null;

    const url = editando
        ? `${API_URL}/${tipoAtividade}/${atividadeEmEdicao}`
        : `${API_URL}/${tipoAtividade}`;

    const metodo = editando ? "PUT" : "POST";

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Não foi possível salvar a atividade. Verifique os dados.");
            }

            mostrarMensagem(
                editando
                    ? "Atividade atualizada com sucesso!"
                    : "Atividade cadastrada com sucesso!",
                "success"
            );

            limparFormulario();
            carregarAtividades();
        })
        .catch(erro => {
            console.error(erro);
            mostrarMensagem(erro.message, "danger");
        })
        .finally(() => {
            botaoSalvar.disabled = false;
            botaoSalvar.textContent = "Salvar atividade";
        });
});


// PREPARAR FORMULÁRIO PARA EDIÇÃO
function prepararEdicao(atividade) {
    atividadeEmEdicao = atividade.id;

    tipo.value = atividade.professor !== undefined
        ? "curso"
        : "workshop";

    tipo.dispatchEvent(new Event("change"));

    titulo.value = atividade.titulo;
    ano.value = atividade.ano;

    if (tipo.value === "curso") {
        professor.value = atividade.professor;
        cargaHoraria.value = atividade.cargaHoraria;
        vagas.value = atividade.vagas;
    } else {
        instrutor.value = atividade.instrutor;
        local.value = atividade.local;
        duracaoHoras.value = atividade.duracaoHoras;
    }

    tipo.disabled = true;

    tituloFormulario.textContent = "Editar atividade";
    botaoSalvar.textContent = "Atualizar atividade";
    botaoCancelar.classList.remove("d-none");

    document.getElementById("interacao").scrollIntoView({
        behavior: "smooth"
    });
}


// LIMPAR FORMULÁRIO
function limparFormulario() {
    formAtividade.reset();

    atividadeEmEdicao = null;
    tipo.disabled = false;

    camposCurso.classList.add("d-none");
    camposWorkshop.classList.add("d-none");

    tituloFormulario.textContent = "Nova atividade";
    botaoSalvar.textContent = "Salvar atividade";
    botaoCancelar.classList.add("d-none");
}


// CANCELAR EDIÇÃO
botaoCancelar.addEventListener("click", () => {
    limparFormulario();
    mensagem.classList.add("d-none");
});


// EXCLUIR ATIVIDADE (DELETE)
function excluirAtividade(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta atividade?");

    if (!confirmar) {
        return;
    }

    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Não foi possível excluir a atividade.");
            }

            mostrarMensagem("Atividade excluída com sucesso!", "success");
            carregarAtividades();
        })
        .catch(erro => {
            console.error(erro);
            mostrarMensagem(erro.message, "danger");
        });
}


// INICIAR A PÁGINA
carregarAtividades();
