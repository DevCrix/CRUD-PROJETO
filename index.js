import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {getFirestore, collection, addDoc, deleteDoc, getDocs, onSnapshot, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
const firebaseApp = initializeApp({

    apiKey: "AIzaSyAu96eT7keg9NQL3KMTxYx1M3sy9X3ikE0",
    authDomain: "consulta-de-estoque.firebaseapp.com",
    projectId: "consulta-de-estoque",
    storageBucket: "consulta-de-estoque.appspot.com",
    messagingSenderId: "114671269632",
    appId: "1:114671269632:web:cecc0ca886b10c8ee7a5e5",
    measurementId: "G-H023H7RYNX",
});
  const db=getFirestore(firebaseApp);
  const CadastroCol=collection(db, 'produtos');

// Obtém uma referência para o botão de cadastro
const cadastrarBtn = document.getElementById('cadastrarBtn');

// Obtém uma referência para o seletor de filtro de categoria
const filtroCategoria = document.getElementById('filtroCategoria');

// Função para carregar os dados do Firestore e atualizar a tabela
async function carregarDadosFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'produtos'));
    const numeroEntidades = querySnapshot.size;
    console.log(`Número de entidades: ${numeroEntidades}`);

    const tabela = document.querySelector('.tabelaUsuarios');

    // Limpa a tabela
    tabela.innerHTML = '';

  

    querySnapshot.forEach((documento) => {
      const dados = documento.data();

      // Cria uma nova linha para a tabela
      const novaLinha = document.createElement('tr');

      // Cria células para cada coluna da nova linha
      const colunaNome = criarCelulaEditavel(dados.nome);
      const colunaPreco = criarCelulaEditavel(dados.preco);
      const colunaValidade = criarCelulaEditavel(dados.validade);
      const colunaCategoria = criarCelulaEditavel(dados.categoria);
      const colunaVirtual = criarCelulaEditavel(dados.virtual);
      const colunaSituacao = criarCelulaEditavel(dados.situacao);

      const colunaOpcoes = document.createElement('td');

      // Botão Remover
      const botaoRemover = document.createElement('button');
      const imgRemover = document.createElement('img');
      imgRemover.src = 'img/excluir.png';
      imgRemover.alt = 'Remover periférico';
      botaoRemover.appendChild(imgRemover);
      colunaOpcoes.appendChild(botaoRemover);

      // Adiciona as células à nova linha
      novaLinha.appendChild(colunaNome);
      novaLinha.appendChild(colunaPreco);
      novaLinha.appendChild(colunaValidade);
      novaLinha.appendChild(colunaCategoria);
      novaLinha.appendChild(colunaVirtual);
      novaLinha.appendChild(colunaSituacao);
      novaLinha.appendChild(colunaOpcoes);

      novaLinha.dataset.id = documento.id;

      // Botão Remover
      botaoRemover.addEventListener('click', function () {
        // Obtém o ID do documento a ser removido
        const id = documento.id;

        // Remove o documento do Firestore
        deleteDoc(doc(db, 'produtos', id))
          .then(() => {
            console.log('Documento removido com sucesso!');
          })
          .catch((error) => {
            console.error('Erro ao remover documento: ', error);
          });
      });

      // Atualiza os dados no Firestore quando houver alterações
      novaLinha.addEventListener('input', function () {
        const id = documento.id;

        // Atualiza os dados no Firestore
        updateDoc(doc(db, 'produtos', id), {
          nome: colunaNome.firstChild.value,
          preco: colunaPreco.firstChild.value,
          validade: colunaValidade.firstChild.value,
          categoria: colunaCategoria.firstChild.value,
          virtual: colunaVirtual.firstChild.value,
          situacao: colunaSituacao.firstChild.value,
        })
          .then(() => {
            console.log('Documento atualizado com sucesso!');
          })
          .catch((error) => {
            console.error('Erro ao atualizar documento: ', error);
          });
      });

      // Adiciona a nova linha à tabela
      tabela.appendChild(novaLinha);
    });
  } catch (error) {
    console.error('Erro ao carregar dados do Firestore:', error);
  }
}

// Função auxiliar para criar célula editável
function criarCelulaEditavel(valor) {
  const coluna = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = valor;
  coluna.appendChild(input);
  return coluna;
}

// Adiciona um ouvinte de evento de clique ao botão de cadastro
cadastrarBtn.addEventListener('click', async function (e) {
  e.preventDefault(); // Previne o comportamento padrão do formulário

  // Obtém os valores dos campos de entrada
  const nome = document.getElementById('nome').value;
  const preco = document.getElementById('preço').value;
  const validade = document.getElementById('validade').value;
  const categoria = document.getElementById('categoria').value;
  const virtual = document.getElementById('virtual').checked ? 'Sim' : 'Não';
  const situacao = document.getElementById('situação').value;

  try {
    // Adiciona as informações ao Firestore
    await addDoc(CadastroCol, {
      nome: nome,
      preco: preco,
      validade: validade,
      categoria: categoria,
      virtual: virtual,
      situacao: situacao,
    });

    // Limpa os campos de entrada após o cadastro
    document.getElementById('nome').value = '';
    document.getElementById('preço').value = '';
    document.getElementById('validade').value = '';
    document.getElementById('categoria').selectedIndex = 0;
    document.getElementById('virtual').checked = false;
    document.getElementById('situação').selectedIndex = 0;
  } catch (error) {
    console.log(error);
  }
});

// Adiciona um ouvinte de evento de alteração ao seletor de filtro de categoria
filtroCategoria.addEventListener('change', function () {
  const categoriaSelecionada = filtroCategoria.value;

  // Obtém todas as linhas da tabela, exceto a primeira (cabeçalho)
  const linhasTabela = document.querySelectorAll('.tabelaUsuarios tr:not(:first-child)');

  // Itera sobre as linhas da tabela
  linhasTabela.forEach(function (linha) {
    const colunaCategoria = linha.querySelector('td:nth-child(4)');

    if (categoriaSelecionada === 'Todos' || colunaCategoria.firstChild.value === categoriaSelecionada) {
      linha.style.display = ''; // Exibe a linha se corresponder à categoria selecionada
    } else {
      linha.style.display = 'none'; // Oculta a linha se não corresponder à categoria selecionada
    }
  });
});

// Carrega os dados do Firestore e atualiza a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
  carregarDadosFirestore();

  // Ouve as alterações no Firestore e atualiza a tabela em tempo real
  onSnapshot(collection(db, 'produtos'), carregarDadosFirestore);
});
