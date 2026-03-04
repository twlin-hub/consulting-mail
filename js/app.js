// app.js - 앱 동작 로직
// UI 렌더링, 이벤트 처리, 상태 관리

// ============================================================
// 전역 상태
// ============================================================
let respondents = [];
let studentList = [];
let filteredRespondents = [];
let selectedIndex = -1;
let currentFilter = 'all';
let duplicateEmails = [];
let progressData = null;


// ============================================================
// 초기화
// ============================================================
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadData();
}


// ============================================================
// 데이터 로딩
// ============================================================
async function loadData() {
    showLoading();
    
    try {
        // 설문 응답 데이터 로딩
        respondents = await loadSheetData();
        
        // 중복 이메일 체크
        const duplicateResult = markDuplicates(respondents);
        respondents = duplicateResult.respondents;
        duplicateEmails = duplicateResult.duplicates;
        
        // 수강생 명단 로딩
        try {
            studentList = await loadStudentList();
            progressData = calculateProgress(respondents, studentList);
        } catch (e) {
            console.warn('수강생 명단 로딩 실패:', e);
            studentList = [];
            progressData = null;
        }
        
        updateStats();
        updateProgressBar();
        applyFilter();
        
        // 중복 이메일 경고
        if (duplicateEmails.length > 0) {
            showDuplicateWarning();
        }
        
        showToast('✅ 데이터를 불러왔습니다.');
    } catch (error) {
        showError('데이터를 불러오지 못했습니다.');
    }
}

function showLoading() {
    document.getElementById('respondentList').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>데이터를 불러오는 중...</p>
        </div>
    `;
}

function showError(message) {
    document.getElementById('respondentList').innerHTML = `
        <div class="empty-state">
            <p>${message}</p>
        </div>
    `;
}


// ============================================================
// 통계 업데이트
// ============================================================
function updateStats() {
    const stats = calculateStats(respondents);
    const duplicateCount = respondents.filter(r => r._duplicate).length;
    
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('sentCount').textContent = stats.sent;
    document.getElementById('filterAllCount').textContent = stats.total;
    document.getElementById('filterPendingCount').textContent = stats.pending;
    document.getElementById('filterSentCount').textContent = stats.sent;
    
    // 중복 카운트
    const duplicateCountEl = document.getElementById('duplicateCount');
    const filterDuplicateCountEl = document.getElementById('filterDuplicateCount');
    if (duplicateCountEl) duplicateCountEl.textContent = duplicateCount;
    if (filterDuplicateCountEl) filterDuplicateCountEl.textContent = duplicateCount;
}

function updateProgressBar() {
    const progressSection = document.getElementById('progressSection');
    if (!progressSection) return;
    
    if (progressData) {
        const { totalStudents, respondedCount, sentCount, responseRate, sentRate, notResponded, refundedStudents, refundedCount, emailOnlyCount, coffeeOnlyCount, bothCount } = progressData;
        
        progressSection.innerHTML = `
            <div class="progress-title">📊 전체 진척률</div>
            <div class="progress-stats">
                <div class="progress-stat">
                    <span class="progress-label">전체 수강생</span>
                    <span class="progress-value">${totalStudents}명</span>
                    ${refundedCount > 0 ? `<span class="progress-sub">(환불 ${refundedCount}명 제외)</span>` : ''}
                </div>
                <div class="progress-stat">
                    <span class="progress-label">설문 응답</span>
                    <span class="progress-value">${respondedCount}명 (${responseRate}%)</span>
                </div>
                <div class="progress-stat">
                    <span class="progress-label">컨설팅 완료</span>
                    <span class="progress-value">${sentCount}명 (${sentRate}%)</span>
                    <span class="progress-sub">이메일 ${emailOnlyCount} / 커피챗 ${coffeeOnlyCount} / 둘다 ${bothCount}</span>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-bar-sent" style="width: ${sentRate}%"></div>
                    <div class="progress-bar-responded" style="width: ${responseRate - sentRate}%"></div>
                </div>
                <div class="progress-legend">
                    <span class="legend-item"><span class="legend-color sent"></span>발송완료</span>
                    <span class="legend-item"><span class="legend-color responded"></span>응답완료</span>
                    <span class="legend-item"><span class="legend-color remaining"></span>미응답</span>
                </div>
            </div>
            ${notResponded.length > 0 ? `
                <details class="not-responded-details">
                    <summary>📋 미응답자 ${notResponded.length}명 보기</summary>
                    <div class="not-responded-list">
                        ${notResponded.map(s => `<span class="not-responded-name">${s[CONFIG.studentColumns.name]} (${s[CONFIG.studentColumns.grade] || '-'})</span>`).join('')}
                    </div>
                </details>
            ` : ''}
            ${refundedCount > 0 ? `
                <details class="refunded-details">
                    <summary>💰 환불자 ${refundedCount}명 보기</summary>
                    <div class="not-responded-list">
                        ${refundedStudents.map(s => `<span class="refunded-name">${s[CONFIG.studentColumns.name]} (${s[CONFIG.studentColumns.grade] || '-'})</span>`).join('')}
                    </div>
                </details>
            ` : ''}
        `;
        progressSection.style.display = 'block';
    } else {
        progressSection.style.display = 'none';
    }
}

function showDuplicateWarning() {
    const warningEl = document.getElementById('duplicateWarning');
    if (warningEl && duplicateEmails.length > 0) {
        warningEl.innerHTML = `
            <strong>⚠️ 중복 이메일 ${duplicateEmails.length}건 발견</strong>
            <p>같은 이메일로 여러 번 응답한 경우가 있습니다. "중복" 필터로 확인하세요.</p>
            <ul>
                ${duplicateEmails.map(d => `<li>${d.email} (${d.names.join(', ')})</li>`).join('')}
            </ul>
        `;
        warningEl.style.display = 'block';
    }
}


// ============================================================
// 필터링
// ============================================================
function setFilter(filter) {
    currentFilter = filter;
    
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter' + capitalize(filter)).classList.add('active');
    
    applyFilter();
}

function applyFilter() {
    filteredRespondents = filterRespondents(respondents, currentFilter);
    
    // 정렬: 미발송 → 상단, 발송완료 → 하단
    // 각 그룹 내에서는 최신 응답이 위로 (역순)
    filteredRespondents.sort((a, b) => {
        // 1. 발송완료 여부로 먼저 정렬
        if (a._sent !== b._sent) {
            return a._sent ? 1 : -1;  // 미발송이 위로
        }
        // 2. 같은 그룹 내에서는 최신순 (인덱스 역순)
        return respondents.indexOf(b) - respondents.indexOf(a);
    });
    
    selectedIndex = -1;
    renderRespondentList();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// ============================================================
// 응답자 목록 렌더링
// ============================================================
function renderRespondentList() {
    const listEl = document.getElementById('respondentList');
    
    if (filteredRespondents.length === 0) {
        const messages = {
            'all': '응답이 없습니다.',
            'pending': '미발송 응답자가 없습니다.',
            'sent': '발송완료된 응답자가 없습니다.',
            'duplicate': '중복 이메일이 없습니다.'
        };
        listEl.innerHTML = `<div class="empty-state"><p>${messages[currentFilter]}</p></div>`;
        return;
    }
    
    // 미발송 / 발송완료 분리
    const pendingList = filteredRespondents.filter(r => !r._sent);
    const sentList = filteredRespondents.filter(r => r._sent);
    
    // 응답자 카드 생성 함수
    const createCard = (r, index) => {
        const name = r[CONFIG.columns.name];
        const email = r[CONFIG.columns.email];
        const course = r[CONFIG.columns.course] || '과정 미상';
        const timestamp = r[CONFIG.columns.timestamp] || '';
        const isSent = r._sent;
        const isDuplicate = r._duplicate;
        const isActive = index === selectedIndex;
        
        let statusBadge = '';
        if (isSent) {
            statusBadge = '<span class="status-badge sent">✅ 발송완료</span>';
        }
        if (isDuplicate) {
            statusBadge += '<span class="status-badge duplicate">⚠️ 중복</span>';
        }
        
        return `
            <div class="respondent-item ${isSent ? 'sent' : ''} ${isDuplicate ? 'duplicate' : ''} ${isActive ? 'active' : ''}" 
                 onclick="selectRespondent(${index})">
                <div class="respondent-header">
                    <div class="respondent-name">${name}</div>
                    <div class="status-badges">${statusBadge}</div>
                </div>
                <div class="respondent-email">${email}</div>
                <div class="respondent-tags">
                    <span class="tag">${course}</span>
                </div>
                ${timestamp ? `<div class="respondent-date">응답: ${timestamp}</div>` : ''}
            </div>
        `;
    };
    
    // 미발송 목록 HTML
    let html = '';
    
    if (pendingList.length > 0) {
        html += `<div class="list-section-title">📋 미발송 (${pendingList.length}명)</div>`;
        html += pendingList.map((r) => {
            const originalIndex = filteredRespondents.indexOf(r);
            return createCard(r, originalIndex);
        }).join('');
    }
    
    // 발송완료 목록 HTML (접기/펼치기)
    if (sentList.length > 0) {
        html += `
            <details class="sent-section">
                <summary class="list-section-title sent-toggle">✅ 발송완료 (${sentList.length}명)</summary>
                <div class="sent-list">
                    ${sentList.map((r) => {
                        const originalIndex = filteredRespondents.indexOf(r);
                        return createCard(r, originalIndex);
                    }).join('')}
                </div>
            </details>
        `;
    }
    
    listEl.innerHTML = html;
}


// ============================================================
// 응답자 선택 & 메일 생성
// ============================================================
function selectRespondent(index) {
    const data = filteredRespondents[index];
    
    // 중복 이메일 경고
    if (data._duplicate && data._sent) {
        if (!confirm('⚠️ 이미 발송된 중복 이메일입니다. 계속하시겠습니까?')) {
            return;
        }
    } else if (data._duplicate) {
        showToast('⚠️ 중복 이메일입니다. 발송 전 확인하세요.');
    }
    
    selectedIndex = index;
    renderRespondentList();
    
    const name = data[CONFIG.columns.name];
    const email = data[CONFIG.columns.email];
    
    // 메일 정보 업데이트
    document.getElementById('mailTo').textContent = `${name} <${email}>`;
    document.getElementById('mailSubject').textContent = generateMailSubject(name);
    
    // 메일 본문 생성
    const mailBody = generateMailBody(data);
    
    document.getElementById('mailContent').style.display = 'none';
    document.getElementById('mailBody').style.display = 'block';
    document.getElementById('mailBody').textContent = mailBody;
}


// ============================================================
// 복사 기능
// ============================================================
function copyMail() {
    if (selectedIndex < 0) {
        showToast('먼저 응답자를 선택해 주세요.');
        return;
    }
    
    const subject = document.getElementById('mailSubject').textContent;
    const body = document.getElementById('mailBody').textContent;
    const fullMail = `제목: ${subject}\n\n${body}`;
    
    navigator.clipboard.writeText(fullMail).then(() => {
        showToast('✅ 메일 전문이 복사되었습니다.');
    });
}

function copySubject() {
    if (selectedIndex < 0) {
        showToast('먼저 응답자를 선택해 주세요.');
        return;
    }
    
    const subject = document.getElementById('mailSubject').textContent;
    
    navigator.clipboard.writeText(subject).then(() => {
        showToast('✅ 제목이 복사되었습니다.');
    });
}

function copyEmail() {
    if (selectedIndex < 0) {
        showToast('먼저 응답자를 선택해 주세요.');
        return;
    }
    
    const data = filteredRespondents[selectedIndex];
    const email = data[CONFIG.columns.email];
    
    navigator.clipboard.writeText(email).then(() => {
        showToast('✅ 메일 주소가 복사되었습니다.');
    });
}

// ============================================================
// 토스트 메시지
// ============================================================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
