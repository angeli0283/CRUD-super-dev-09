const botaoSalvar = document.getElementsByClassName("botao-salvar")[0];
botaoSalvar.addEventListener("click", salvarAnimal);

const campoNome = document.getElementById("campo-nome");
const campoCategoria = document.getElementById("animais");
const corpoTabela = document.getElementById("categorias");

const urlBase = "https://api.franciscosensaulas.com/api/v1/biblioteca/categorias";

let idParaEditar = -1;

function salvarAnimal(evento) {
    evento.preventDefault();
    const nome = campoNome.value.trim();

    if (!nome) {
        alert("Por favor, escreva o nome do animal.");
        return;
    }

    if (campoCategoria.selectedIndex === 0) {
        alert("Por favor, selecione uma classificação.");
        return;
    }

    if (idParaEditar === -1) {
        cadastrarAnimal(nome);
    } else {
        editarAnimal(nome);
    }
}

function limparCampos() {
    campoNome.value = "";
    campoCategoria.selectedIndex = 0;
    idParaEditar = -1;
}

function montarNomeCompleto(nome, classificacao) {
    return `${nome}|${classificacao}`;
}

function separarNomeClassificacao(nomeCompleto) {
    if (nomeCompleto && nomeCompleto.includes("|")) {
        const partes = nomeCompleto.split("|");
        return { nome: partes[0], classificacao: partes[1] };
    }
    return { nome: nomeCompleto, classificacao: "Sem classificação" };
}

function cadastrarAnimal(nomeAnimal) {
    const classificacao = campoCategoria.value;
    const dados = { nome: montarNomeCompleto(nomeAnimal, classificacao) };

    fetch(urlBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (response.status === 201) {
                alert("Animal cadastrado com sucesso!");
                limparCampos();
                listarAnimais();
            } else {
                alert("Não foi possível cadastrar o animal.");
            }
        })
        .catch(error => {
            console.error("Erro ao cadastrar animal: " + error);
            alert("Ocorreu um erro ao tentar cadastrar o animal.");
        });
}

function editarAnimal(nomeParaEditar) {
    const url = `${urlBase}/${idParaEditar}`;
    const classificacao = campoCategoria.value;
    const dados = { nome: montarNomeCompleto(nomeParaEditar, classificacao) };

    fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (response.status === 204) {
                alert("Animal alterado com sucesso!");
                limparCampos();
                listarAnimais();
            } else if (response.status === 404) {
                alert("Não foi possível encontrar o animal.");
            } else {
                alert("Não foi possível alterar o animal.");
            }
        })
        .catch(error => {
            console.error("Erro ao editar animal: " + error);
            alert("Ocorreu um erro ao tentar alterar o animal.");
        });
}

function listarAnimais() {
    corpoTabela.innerHTML = "";

    fetch(urlBase)
        .then(response => response.json())
        .then(animais => {
            if (!animais || animais.length === 0) {
                corpoTabela.innerHTML = `<tr><td colspan="4" style="text-align:center">Nenhum animal cadastrado.</td></tr>`;
                return;
            }
            for (let i = 0; i < animais.length; i++) {
                criarLinha(animais[i]);
            }
            adicionarCliqueBotoesLinhas();
        })
        .catch(error => {
            console.error("Erro ao listar animais: " + error);
            alert("Ocorreu um erro ao tentar listar os animais.");
        });
}

function criarLinha(animal) {
    const { nome, classificacao } = separarNomeClassificacao(animal.nome);

    const linha = `<tr>
        <td>${animal.id}</td>
        <td>${nome}</td>
        <td>${classificacao}</td>
        <td>
            <button class="botao-editar" data-id="${animal.id}">
                <i class="fa-solid fa-pencil"></i> Editar
            </button>
            <button class="botao-apagar" data-id="${animal.id}">
                <i class="fa-solid fa-trash"></i> Apagar
            </button>
        </td>
    </tr>`;

    corpoTabela.innerHTML += linha;
}

function adicionarCliqueBotoesLinhas() {
    const botoesApagar = document.getElementsByClassName("botao-apagar");
    for (let i = 0; i < botoesApagar.length; i++) {
        botoesApagar[i].addEventListener("click", apagarAnimal);
    }

    const botoesEditar = document.getElementsByClassName("botao-editar");
    for (let i = 0; i < botoesEditar.length; i++) {
        botoesEditar[i].addEventListener("click", preencherCamposParaEditar);
    }
}

function apagarAnimal(evento) {
    const botaoApagar = evento.target.closest(".botao-apagar");
    const idParaApagar = botaoApagar.getAttribute("data-id");

    const confirmacaoApagar = confirm("Deseja realmente apagar este animal?");
    if (!confirmacaoApagar) return;

    const url = `${urlBase}/${idParaApagar}`;

    fetch(url, { method: "DELETE" })
        .then(response => {
            if (response.status === 204) {
                alert("Animal apagado com sucesso!");
                listarAnimais();
            } else {
                alert("Não foi possível apagar o animal.");
            }
        })
        .catch(error => {
            console.error("Erro ao apagar: " + error);
            alert("Ocorreu um erro ao tentar apagar o animal.");
        });
}

function preencherCamposParaEditar(evento) {
    const botaoEditar = evento.target.closest(".botao-editar");
    idParaEditar = botaoEditar.getAttribute("data-id");

    const url = `${urlBase}/${idParaEditar}`;

    fetch(url)
        .then(response => response.json())
        .then(animal => {
            const { nome, classificacao } = separarNomeClassificacao(animal.nome);
            campoNome.value = nome;
            campoCategoria.value = classificacao !== "Sem classificação" ? classificacao : "";
            if (campoCategoria.value === "") campoCategoria.selectedIndex = 0;
        })
        .catch(error => {
            console.error("Erro ao buscar animal para edição: " + error);
            alert("Ocorreu um erro ao tentar buscar o animal.");
        });
}

listarAnimais();
