// app.js - 앱 동작 로직
// UI 렌더링, 이벤트 처리, 상태 관리

// ============================================================
// 전역 상태
// ============================================================
let respondents = [];
let filteredRespondents = [];
let selectedIndex = -1;
let currentFilter = 'all';


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
        respondents = await loadSheetData();
        updateStats();
        applyFilter();
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
    
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('sentCount').textContent = stats.sent;
    document.getElementById('filterAllCount').textContent = stats.total;
    document.getElementById('filterPendingCount').textContent = stats.pending;
    document.getElementById('filterSentCount').textContent = stats.sent;
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
            'sent': '발송완료된 응답자가 없습니다.'
        };
        listEl.innerHTML = `<div class="empty-state"><p>${messages[currentFilter]}</p></div>`;
        return;
    }
    
    listEl.innerHTML = filteredRespondents.map((r, index) => {
        const name = r[CONFIG.columns.name];
        const email = r[CONFIG.columns.email];
        const course = r[CONFIG.columns.course] || '과정 미상';
        const timestamp = r[CONFIG.columns.timestamp] || '';
        const isSent = r._sent;
        const isActive = index === selectedIndex;
        
        return `
            <div class="respondent-item ${isSent ? 'sent' : ''} ${isActive ? 'active' : ''}" 
                 onclick="selectRespondent(${index})">
                <div class="respondent-name">${name}</div>
                <div class="respondent-email">${email}</div>
                <div class="respondent-tags">
                    <span class="tag">${course}</span>
                </div>
                ${timestamp ? `<div class="respondent-date">응답: ${timestamp}</div>` : ''}
            </div>
        `;
    }).join('');
}


// ============================================================
// 응답자 선택 & 메일 생성
// ============================================================
function selectRespondent(index) {
    selectedIndex = index;
    renderRespondentList();
    
    const data = filteredRespondents[index];
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
