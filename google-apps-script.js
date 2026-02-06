/**
 * Google Apps Script - Cadastros para Google Sheets
 *
 * COMO USAR:
 * 1. Crie uma planilha no Google Sheets (sheets.google.com).
 * 2. Menu: Extensões > Apps Script.
 * 3. Apague o conteúdo do arquivo Code.gs e cole este código.
 * 4. Salve (Ctrl+S). Na primeira vez, dê um nome ao projeto (ex: Cine15 Cadastros).
 * 5. Menu: Implantar > Nova implantação > Tipo: Aplicativo da Web.
 *    - Descrição: ex. "Receber cadastros do site"
 *    - Executar como: Eu (seu e-mail)
 *    - Quem tem acesso: Qualquer pessoa
 * 6. Clique em Implantar. Autorize o script quando pedir.
 * 7. Copie a URL do aplicativo da web e cole no script.js na variável SHEETS_WEB_APP_URL
 *    (substitua SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI).
 *
 * A planilha usada será a mesma onde você abriu "Apps Script".
 * A primeira linha será preenchida com os títulos das colunas na primeira execução.
 */

function doGet(e) {
  var params = e.parameter;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Cabeçalho na primeira linha (só na primeira vez ou se a planilha estiver vazia)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data/Hora', 'Nome', 'WhatsApp', 'Data da Festa', 'Tema', 'Pacote']);
  }

  var nome = params.nome || '';
  var whatsapp = params.whatsapp || '';
  var dataFesta = params.dataFesta || '';
  var tema = params.tema || '';
  var pacote = params.pacote || '';

  // Formatar data da festa para exibição (YYYY-MM-DD -> DD/MM/YYYY)
  var dataFestaFormatada = dataFesta;
  if (dataFesta && dataFesta.length >= 10) {
    dataFestaFormatada = dataFesta.substr(8, 2) + '/' + dataFesta.substr(5, 2) + '/' + dataFesta.substr(0, 4);
  }

  var labelsTema = { classico: 'Clássico', balada: 'Balada', jardim: 'Jardim', outro: 'Outro' };
  var labelsPacote = { silver: 'Silver', gold: 'Gold', diamond: 'Diamond' };
  var temaLabel = labelsTema[tema] || tema;
  var pacoteLabel = labelsPacote[pacote] || pacote;

  var agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  sheet.appendRow([agora, nome, whatsapp, dataFestaFormatada, temaLabel, pacoteLabel]);

  // Resposta simples para o navegador (opcional; com mode: no-cors o front não lê)
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
