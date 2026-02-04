// data.js - 데이터 불러오기 및 파싱
// 구글 스프레드시트에서 데이터를 불러오고 파싱하는 함수들

/**
 * 설문 응답 데이터 불러오기
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
 * 수강생 명단 데이터 불러오기
 */
async function loadStudentList() {
    try {
        const response = await fetch(CONFIG.studentListUrl);
        const csvText = await response.text();
        return parseStudentCSV(csvText);
    } catch (error) {
        console.error('수강생 명단 로딩 실패:', error);
        throw error;
    }
}

/**
 * CSV 텍스트를 객체 배열로 파싱 (설문 응답용)
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
                // 발송완료 여부 플래그 추가 ("1"이면 발송완료)
                const sentValue = (row[CONFIG.columns.sent] || '').trim();
                row['_sent'] = sentValue === CONFIG.sentValue || sentValue === '1';
                data.push(row);
            }
        }
    }
    
    return data;
}

/**
 * CSV 텍스트를 객체 배열로 파싱 (수강생 명단용)
 */
function parseStudentCSV(csv) {
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
            
            // 성명이 있는 행만 추가
            if (row[CONFIG.studentColumns.name]) {
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
 * 통계 계산 (기본)
 */
function calculateStats(respondents) {
    const total = respondents.length;
    const sent = respondents.filter(r => r._sent).length;
    const pending = total - sent;
    
    return { total, sent, pending };
}

/**
 * 진척률 계산 (수강생 명단 대비)
 */
function calculateProgress(respondents, studentList) {
    const totalStudents = studentList.length;
    const respondedCount = respondents.length;
    const sentCount = respondents.filter(r => r._sent).length;
    
    // 설문 응답률
    const responseRate = totalStudents > 0 
        ? Math.round((respondedCount / totalStudents) * 100) 
        : 0;
    
    // 발송 완료율 (전체 수강생 대비)
    const sentRate = totalStudents > 0 
        ? Math.round((sentCount / totalStudents) * 100) 
        : 0;
    
    // 미응답자 명단 (수강생 명단에는 있지만 설문 응답에 없는 사람)
    const respondentNames = respondents.map(r => r[CONFIG.columns.name].trim());
    const notResponded = studentList.filter(s => {
        const studentName = s[CONFIG.studentColumns.name].trim();
        return !respondentNames.includes(studentName);
    });
    
    return {
        totalStudents,
        respondedCount,
        sentCount,
        responseRate,
        sentRate,
        notResponded
    };
}

/**
 * 중복 이메일 체크
 */
function findDuplicateEmails(respondents) {
    const emailCount = {};
    const duplicates = [];
    
    respondents.forEach((r, index) => {
        const email = (r[CONFIG.columns.email] || '').toLowerCase().trim();
        if (email) {
            if (emailCount[email]) {
                emailCount[email].push(index);
            } else {
                emailCount[email] = [index];
            }
        }
    });
    
    // 중복된 이메일만 추출
    Object.keys(emailCount).forEach(email => {
        if (emailCount[email].length > 1) {
            duplicates.push({
                email,
                indices: emailCount[email],
                names: emailCount[email].map(i => respondents[i][CONFIG.columns.name])
            });
        }
    });
    
    return duplicates;
}

/**
 * 응답자에게 중복 플래그 추가
 */
function markDuplicates(respondents) {
    const duplicates = findDuplicateEmails(respondents);
    const duplicateIndices = new Set();
    
    duplicates.forEach(dup => {
        dup.indices.forEach(i => duplicateIndices.add(i));
    });
    
    respondents.forEach((r, index) => {
        r['_duplicate'] = duplicateIndices.has(index);
    });
    
    return { respondents, duplicates };
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
        case 'duplicate':
            return respondents.filter(r => r._duplicate);
        default:
            return [...respondents];
    }
}
