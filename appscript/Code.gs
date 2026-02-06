/**
 * Cole este código no Google Apps Script da sua planilha:
 * Extensões > Apps Script > apague o conteúdo de Code.gs e cole aqui.
 * Depois: Implantar > Nova implantação > Aplicativo da Web > Qualquer pessoa.
 * Copie a URL e use no script.js (SHEETS_WEB_APP_URL).
 */

function doGet(e) {
  var params = e.parameter;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data/Hora', 'Nome', 'WhatsApp', 'Data da Festa', 'Tema', 'Pacote']);
  }

  var nome = params.nome || '';
  var whatsapp = params.whatsapp || '';
  var dataFesta = params.dataFesta || '';
  var tema = params.tema || '';
  var pacote = params.pacote || '';

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

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
