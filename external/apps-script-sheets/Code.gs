const SHEETS_SIGNING_SECRET = 'uma_chave_forte_32_chars';
const SPREADSHEET_ID = '<<COLE AQUI O ID DA PLANILHA>>';

function doPost(e) {
  try {
    const body = e.postData.contents;
    const signature = (e.parameter && e.parameter['X-Star-Signature']) ||
      (e.headers && e.headers['X-Star-Signature']);

    if (!verifySignature_(body, signature)) {
      return ContentService.createTextOutput('unauthorized').setMimeType(ContentService.MimeType.TEXT);
    }

    const payload = JSON.parse(body);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    switch (payload.entity) {
      case 'ap_invoices': {
        const sheet = ss.getSheetByName('AP_INVOICES') || ss.insertSheet('AP_INVOICES');
        appendInvoice_(sheet, payload.record);
        break;
      }
      case 'payments': {
        const sheet = ss.getSheetByName('PAYMENTS') || ss.insertSheet('PAYMENTS');
        appendPayment_(sheet, payload.record);
        break;
      }
      case 'reimbursements': {
        const sheet = ss.getSheetByName('REIMBURSEMENTS') || ss.insertSheet('REIMBURSEMENTS');
        appendReimbursement_(sheet, payload.record);
        break;
      }
      case 'assets': {
        const sheet = ss.getSheetByName('ASSETS') || ss.insertSheet('ASSETS');
        appendAsset_(sheet, payload.record);
        break;
      }
      case 'asset_movements': {
        const sheet = ss.getSheetByName('ASSET_MOVEMENTS') || ss.insertSheet('ASSET_MOVEMENTS');
        appendAssetMovement_(sheet, payload.record);
        break;
      }
      default:
        break;
    }

    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput('error:' + error).setMimeType(ContentService.MimeType.TEXT);
  }
}

function verifySignature_(body, sign) {
  if (!sign) return false;
  const mac = Utilities.computeHmacSha256Signature(body, SHEETS_SIGNING_SECRET);
  const computed = Utilities.base64Encode(mac);
  return computed === sign;
}

function appendInvoice_(sheet, record) {
  const header = ['id','provider_id','hub_id','contract_id','nf_number','nf_date','competence','description','amount','status','attachment_url','created_by','created_at'];
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  const row = [
    record.id,
    record.provider_id,
    record.hub_id,
    record.contract_id,
    record.nf_number,
    record.nf_date,
    record.competence,
    record.description,
    record.amount,
    record.status,
    record.attachment_url,
    record.created_by,
    record.created_at
  ];
  sheet.appendRow(row);
}

function appendPayment_(sheet, record) {
  const header = ['id','ap_invoice_id','paid_at','amount','method','proof_url','created_by','created_at'];
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  const row = [
    record.id,
    record.ap_invoice_id,
    record.paid_at,
    record.amount,
    record.method,
    record.proof_url,
    record.created_by,
    record.created_at
  ];
  sheet.appendRow(row);
}

function appendReimbursement_(sheet, record) {
  const header = [
    'id',
    'requester',
    'hub_id',
    'description',
    'amount',
    'expense_date',
    'status',
    'coordinator_id',
    'approved_by_coordinator',
    'approved_by_finance',
    'reviewed_by_juridico',
    'attachment_url',
    'created_at'
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  const row = [
    record.id,
    record.requester,
    record.hub_id,
    record.description,
    record.amount,
    record.expense_date,
    record.status,
    record.coordinator_id,
    record.approved_by_coordinator,
    record.approved_by_finance,
    record.reviewed_by_juridico,
    record.attachment_url,
    record.created_at
  ];
  sheet.appendRow(row);
}

function appendAsset_(sheet, record) {
  const header = [
    'id',
    'tag',
    'description',
    'category',
    'hub_id',
    'assigned_to',
    'acquisition_date',
    'value',
    'status',
    'location',
    'notes',
    'created_at'
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  const row = [
    record.id,
    record.tag,
    record.description,
    record.category,
    record.hub_id,
    record.assigned_to,
    record.acquisition_date,
    record.value,
    record.status,
    record.location,
    record.notes,
    record.created_at
  ];
  sheet.appendRow(row);
}

function appendAssetMovement_(sheet, record) {
  const header = [
    'id',
    'asset_id',
    'moved_by',
    'previous_user',
    'new_user',
    'moved_at',
    'hub_origin',
    'hub_destination',
    'notes'
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  const row = [
    record.id,
    record.asset_id,
    record.moved_by,
    record.previous_user,
    record.new_user,
    record.moved_at,
    record.hub_origin,
    record.hub_destination,
    record.notes
  ];
  sheet.appendRow(row);
}
