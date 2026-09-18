/**
 * 바코드 스캐너 - 구글시트 저장용 Apps Script
 * 대상 시트: https://docs.google.com/spreadsheets/d/1dGMUjtuZGG9CkSbwQGBFr-yOtI31HLMMUvVHR3_A8U4/
 *
 * 설치 방법
 * 1) 해당 구글시트를 열고 확장 프로그램 > Apps Script 를 연다.
 *    (또는 script.google.com에서 새 프로젝트를 만들어도 됨 - SPREADSHEET_ID로 직접 접근하므로 무관)
 * 2) 아래 코드를 전체 붙여넣고 저장한다.
 * 3) 배포 > 새 배포 > 유형: 웹 앱
 *      - 실행 계정: 나
 *      - 액세스 권한: 모든 사용자
 * 4) 배포 후 나오는 웹 앱 URL을 복사해서
 *    barcode_scanner.html 상단의 GAS_URL 값에 붙여넣는다.
 * 5) 시트에 "스캔기록" 탭이 없으면 첫 저장 시 자동 생성됨.
 */

const SPREADSHEET_ID = '1dGMUjtuZGG9CkSbwQGBFr-yOtI31HLMMUvVHR3_A8U4';
const SHEET_NAME = '스캔기록';

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['스캔일시', '바코드', '제품명', '브랜드', '조회여부']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      data.code || '',
      data.name || '',
      data.brand || '',
      data.found ? '조회됨' : '미등록'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // 최근 스캔 목록 조회용 (선택 사항, 웹앱에서 목록을 다시 불러올 때 사용)
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1).reverse().slice(0, 50).map(r => ({
      time: r[0],
      code: r[1],
      name: r[2],
      brand: r[3],
      found: r[4] === '조회됨'
    }));
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
