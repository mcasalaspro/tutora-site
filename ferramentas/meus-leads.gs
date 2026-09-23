/**
 * MEUS LEADS — planilha que recebe as respostas do "Descubra seu curso" do site da Tutora.
 * Cada pessoa que chega ao resultado vira uma linha: data, nome e e-mail (quando ela deixa),
 * as respostas de cada pergunta, os cursos sugeridos e a trilha.
 *
 * COMO INSTALAR (uma vez só, uns 5 minutos; o mesmo passo a passo está no LEIA-ME, seção "Meus leads"):
 *  1. No Google Planilhas, crie uma planilha em branco e dê o nome "Meus leads".
 *  2. Menu Extensões > Apps Script. Apague o que estiver escrito, cole ESTE ARQUIVO INTEIRO e salve (Ctrl+S).
 *  3. Botão Implantar > Nova implantação > engrenagem > App da Web.
 *       Executar como: Eu     Quem pode acessar: Qualquer pessoa
 *     Clique em Implantar e autorize com a sua conta Google.
 *     (O Google avisa que o app "não foi verificado": clique em Avançado e depois em Acessar. O app é seu.)
 *  4. Copie o "URL do app da Web" (começa com https://script.google.com/ e termina em /exec)
 *     e cole em conteudo/configuracoes.yaml, no campo  leads: link_planilha: "..."
 *  5. Publique o site (2-PUBLICAR.bat). Faça o teste do "Descubra seu curso" e veja a linha aparecer na aba "Leads".
 *
 * Se mudar este código depois: Implantar > Gerenciar implantações > lápis > Versão: Nova versão > Implantar
 * (assim o endereço continua o mesmo).
 */

const ABA = 'Leads';
const PRIMEIRAS_COLUNAS = ['data', 'nome', 'email', 'aceita_emails'];
const MAX_COLUNAS = 60;
const MAX_TEXTO = 500;

/** O site manda as respostas para cá. */
function doPost(e) {
  const trava = LockService.getScriptLock();
  try {
    trava.waitLock(15000);
    const dados = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados) || dados.site) {
      return resposta({ ok: true }); // campo-isca preenchido: é robô, não grava
    }
    const campos = {};
    Object.keys(dados).forEach(function (chave) {
      const k = String(chave).toLowerCase();
      if (!/^[a-z0-9_]{1,40}$/.test(k) || k === 'site' || k === 'data') return;
      campos[k] = limpar(dados[chave]);
    });
    if (campos.email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(campos.email)) campos.email = '';
    const aba = abaDeLeads();
    const cab = cabecalho(aba, Object.keys(campos));
    const linha = cab.map(function (col) {
      if (col === 'data') return new Date();
      return Object.prototype.hasOwnProperty.call(campos, col) ? campos[col] : '';
    });
    aba.appendRow(linha);
    return resposta({ ok: true });
  } catch (erro) {
    return resposta({ ok: false, erro: String(erro) });
  } finally {
    trava.releaseLock();
  }
}

/** Abrir o endereço no navegador mostra se está tudo funcionando. */
function doGet() {
  return resposta({ ok: true, mensagem: 'Meus leads está funcionando.' });
}

function abaDeLeads() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  return planilha.getSheetByName(ABA) || planilha.insertSheet(ABA, 0);
}

/** Garante uma coluna para cada campo que chega (pergunta nova no site = coluna nova aqui). */
function cabecalho(aba, chaves) {
  const ultima = aba.getLastColumn();
  let cab = ultima ? aba.getRange(1, 1, 1, ultima).getValues()[0].map(String) : [];
  if (!cab.length || !cab[0]) cab = PRIMEIRAS_COLUNAS.slice();
  const novas = chaves.filter(function (k) {
    return cab.indexOf(k) === -1;
  });
  cab = cab.concat(novas).slice(0, MAX_COLUNAS);
  if (novas.length || !ultima) {
    aba.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
    aba.setFrozenRows(1);
  }
  return cab;
}

function limpar(valor) {
  let t = valor === null || valor === undefined ? '' : String(valor);
  t = t.replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, MAX_TEXTO);
  // um texto que comece com = + - @ viraria fórmula na planilha
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
