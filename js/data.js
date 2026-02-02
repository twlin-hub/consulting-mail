// data.js - 데이터 불러오기 및 파싱
// 구글 스프레드시트에서 데이터를 불러오고 파싱하는 함수들

/**
 * 스프레드시트에서 데이터 불러오기
 */
async function loadSheetData() {
    try {
        const response = await fetch(CONFIG.sheetUrl);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('데이터 로딩 실패:', error);
        throw error;
    }
}

/**
 * CSV 텍스트를 객체 배열로 파싱
 */
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            
            // 이름이 있는 행만 추가
            if (row[CONFIG.columns.name]) {
                // 발송완료 여부 플래그 추가
                row['_sent'] = (row[CONFIG.columns.sent] || '').toUpperCase() === 'O';
                data.push(row);
            }
        }
    }
    
    return data;
}

/**
 * CSV 한 줄을 파싱 (쉼표, 따옴표 처리)
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result;
}

/**
 * 통계 계산
 */
function calculateStats(respondents) {
    const total = respondents.length;
    const sent = respondents.filter(r => r._sent).length;
    const pending = total - sent;
    
    return { total, sent, pending };
}

/**
 * 필터 적용
 */
function filterRespondents(respondents, filter) {
    switch (filter) {
        case 'pending':
            return respondents.filter(r => !r._sent);
        case 'sent':
            return respondents.filter(r => r._sent);
        default:
            return [...respondents];
    }
}
