// mail.js - 메일 생성 로직
// ⭐ 컨설팅 문구를 수정하려면 이 파일만 편집하세요!

// ============================================================
// 1. 텍스트 변환 맵 (설문 응답 → 자연스러운 문장)
// ============================================================

const TEXT_MAP = {
    // 현재 상황 변환
    status: {
        '아직 준비 중 (창업/활동 시작 전)': '창업/활동을 준비 중',
        '이미 대행사 운영 중 (고객 유치 성공)': '이미 대행사를 운영 중',
        '원고작가/프리랜서로 활동 중': '원고작가/프리랜서로 활동 중',
        '직장 다니면서 부업으로 준비 중': '직장을 다니시면서 부업으로 준비 중'
    },
    
    // 수익화 방식 변환
    monetization: {
        '마케팅 대행사 창업 (법인/개인사업자)': '마케팅 대행사 창업',
        '원고작가로 활동 (프리랜서/외주)': '원고작가로 활동',
        '둘 다 병행하고 싶다': '대행사 창업과 원고작가 활동 병행',
        '아직 결정하지 못했다': '수익화 방향 탐색'
    },
    
    // 가장 큰 고민 변환
    concern: {
        '첫 고객(병원)을 어떻게 확보할지 모르겠다.': '첫 고객(병원) 확보',
        '서비스 구성/가격 책정이 어렵다.': '서비스 구성 및 가격 책정',
        '영업/제안 방법이 어렵다.': '영업 및 제안 방법',
        '실무 역량(글쓰기, 광고 세팅 등)이 부족하다.': '실무 역량 강화',
        '시간 관리/본업과 병행이 어렵다.': '시간 관리 및 본업과의 병행',
        '방향 자체를 못 정하겠다.': '전체적인 방향 설정'
    }
};


// ============================================================
// 2. 컨설팅 문구 템플릿
// ============================================================

const MAIL_TEMPLATES = {
    
    // ----------------------------------------------------------
    // 1️⃣ 방향 제안 (수익화 방식별)
    // ----------------------------------------------------------
    direction: {
        '대행사 창업': (name) => `${name}님께서 선택하신 대행사 창업은 수익의 천장이 높고, 장기적으로 사업 자산을 쌓을 수 있는 방식입니다.

권장 진행 순서:
1) 사업자 등록 (아마겟돈 수강생 세무상담 추천)
2) 핵심 서비스 1~2개 먼저 패키지화
3) 타겟 병원 리스트업 및 영업 시작
4) 첫 고객 확보 후 레퍼런스 구축
핵심은 병원 원장님을 단순 고객으로 모집하기 보다, 
블로그 마케팅을 포함한 병원에서 필요로 하는 마케팅 문제를 풀어주는 것입니다.`,

        '원고작가': (name) => `${name}님께서 선택하신 원고작가 활동은 초기 투자 없이 바로 시작할 수 있고, 실무 역량을 쌓으면서 수익을 만들 수 있는 방식입니다.

권장 진행 순서:
1) 포트폴리오용 샘플 원고 2~3개 작성 (자체 블로그에 타겟 원장님 이름으로 비공개 업로드)
2) 대행사 또는 플랫폼에 공유할 포트폴리오 페이지 제작(노션 페이지 추천)
3) 모집 공고시 레퍼런스 전달 또는 마케팅 대행사에 포트폴리오 전달
4) 첫 프로젝트 수주 및 원고 기획~작성~발행 전 과정 경험(!)
5) 클라이언트 및 담당 업무 확장`,

        '병행': (name) => `${name}님께서 선택하신 병행 방식은 가장 현실적인 접근입니다.

권장 진행 순서:
1) 원고작가로 먼저 시작 (리스크 최소화)
2) 3~6개월간 실무 경험 및 포트폴리오 축적
3) 안정적 수익 확보 후 사업자 등록 검토
4) 기존 클라이언트 외 추가 대행사로 업무 전환`,

        '미정': (name) => `두 가지 방식을 비교해 드립니다.

• 초기 투자: 창업(사업자 등록 필요) vs 원고작가(거의 없음)
• 수익 구조: 창업(월 계약) vs 원고작가(건당 수익)
• 시간 투입: 창업(주 20시간+) vs 원고작가(주 5~10시간)

먼저 원고작가로 시작하시면서 시장을 파악 후 창업 여부를 결정하시길 권장드립니다.`
    },

    // ----------------------------------------------------------
    // 2️⃣ 시작점 안내 (현재 상황별)
    // ----------------------------------------------------------
    startPoint: {
        '준비 중': (name) => `현재 준비 단계이시므로, 기초부터 차근차근 진행하시면 됩니다.

가장 먼저 해야 할 일:
• (창업 루트) 첫 고객 확보를 위한 서비스 구성과 가격 책정부터 정리
• (원고작가 루트) 샘플 원고 2~3개 작성, 잘 쓴 블로그 글 필사 50건 이상 

일단 시작하세요.
먼저 실행 후 보완한다는 방식으로 접근하셔야 성과가 나옵니다.`,

        '운영 중': (name) => `이미 대행사를 운영 중이시므로, 기초 단계는 건너뛰셔도 됩니다.

지금 집중할 것:
• 기존 고객 유지 + 레퍼런스 정리
• 신규 고객 확보 채널 다각화
• 서비스 패키지 고도화`,

        '활동 중': (name) => `현재 원고작가/프리랜서로 활동 중이시므로, 실무 경험은 이미 갖추고 계십니다.

지금 집중할 것:
• 단가 협상력 강화 (포트폴리오 정비)
• 클라이언트 다각화 (1곳 의존 탈피)
• (창업 희망 시) 대행사에서 관리하는 시스템을 내 것으로 확보
• 원고작가 이력을 바탕으로 1:1 케어 맞춤형 서비스를 무기로 영업 시작`,

        '부업': (name) => `직장을 다니시면서 준비 중이시므로, 시간 효율이 가장 중요합니다.

현실적인 접근법:
• 주 5~10시간 투입 가능한 범위에서 시작
• 인근 지역 병원의 마케팅 문제, 아쉬운 점 분석
• "만약 내가 맡아서 한다면 어떻게 바꿀 수 있을지?" 분석보고서 제작
• 인근 병원 제안서 배포
• 퇴근 후/주말 활용한 루틴 만들기`,

        '기본': (name) => `가장 먼저 해야 할 일은 '작은 시작'입니다.

권장 첫 단계:
• 샘플 원고 1개 작성
• 타겟 병원 10곳 리스트업
• "만약 내가 맡아서 한다면 어떻게 바꿀 수 있을지?" 분석보고서 제작
• 인근 병원에 제안서 배포 후 미팅 일정 잡기`
    },

    // ----------------------------------------------------------
    // 3️⃣ 핵심 솔루션 (고민별)
    // ----------------------------------------------------------
    solution: {
        '첫 고객': (name) => `첫 고객을 잡는 가장 현실적인 방법은 '마케팅(블로그) 작업이 중단된 곳'을 타겟으로 잡는겁니다.

왜 중단된 곳 인가?
• 기존 마케팅에 대한 불만족으로 중단된 시점
• 대행사가 없는 경우 많음

액션 플랜:
1) 네이버/카카오맵에서 병원(업종) 검색
2) 해당 병원 SNS 확인 (마케팅 상태 진단)
3) 무료 진단 리포트 제안
4) 미팅 후 저가 패키지로 첫 계약
5) 또는 무료 1개월 마케팅 실행 후 계약 제안`,

        '서비스/가격': (name) => `서비스 구성은 '3단계 패키지'를 권장드립니다.

패키지 예시:
• Basic (월 100~150만원): 브랜드 블로그 관리 10~15건/월
• Standard (월 200~300만원): 브랜드 블로그 + 플레이스
• Premium (월 300만원~): 브랜드 블로그 + 최적 블로그 + 플레이스

첫 업체 가격 책정 원칙:
1) 경쟁사 대비 10~20% 낮게 시작
2) 성과를 기반으로 레퍼런스 쌓이면 추가 업체 계약 시 3개월 후 레퍼런스 쌓이면 가격 인상
3) 단순 가격 상승보다, 가격이 올라간 이유를 상대도 납득할 수 있는 이유 필요
예시) 기존 원고작업 외 디자인 작업을 무료로 진행 or 플레이스 관리, 악플 관리 업무를 추가로 진행`,

        '영업/제안': (name) => `병원 영업은 '가치 선제공' 방식이 효과적입니다.

영업 프로세스:
1) 타겟 병원 선정
2) 마케팅 현황 무료 진단 (1페이지 리포트)
3) "개선점을 공유드립니다" 식으로 접근
4) 관심 보이면 미팅 제안

"팔려고 한다"보다 "도와주려 한다" 포지셔닝이 중요합니다.`,

        '실무 역량': (name) => `실무 역량이 부족하시다면, 원고작가로 먼저 시작하세요.

이유:
• 대행사 밑에서 피드백 받으며 실력 향상
• 돈 받으면서 배우는 구조
• 다양한 병원 업종 경험 가능

6개월 정도 활동하시면 직접 고객을 받을 역량이 됩니다.`,

        '시간 관리': (name) => `본업과 병행하신다면, '주 단위 루틴'이 핵심입니다.

시간 배분 예시 (주 15시간):
• 평일 저녁: 2시간 × 5일 = 10시간 (원고 작성)
• 주말: 2.5시간 × 2일 = 5시간 (영업/관리)

처음 3개월은 '습관 만들기'에 집중하세요.`,

        '방향': (name) => `아직 방향을 못 정하셨다면, 아래 질문에 답해 보세요.

Q1. 주당 투입 가능한 시간은?
• 20시간 이상 → 창업 가능
• 10시간 내외 → 원고작가 권장
• 5시간 이하 → 학습 단계 유지

Q2. 리스크 감수 성향은?
• 도전적 → 창업 / 안정적 → 원고작가

대부분의 경우, 원고작가로 시작 → 경험 축적 → 창업 전환이 가장 안전한 경로입니다.`,

        '기본': (name) => `핵심 원칙을 말씀드립니다.

1) 작게 시작하기 - 완벽한 준비보다 빠른 실행
2) 피드백 받기 - 혼자 고민하지 말고 시장에 부딪히기
3) 레퍼런스 쌓기 - 첫 1건이 가장 중요`
    },

    // ----------------------------------------------------------
    // 4️⃣ 실행 플랜 (목표 시점별)
    // ----------------------------------------------------------
    actionPlan: {
        '1개월': (name) => `1개월 내 시작 목표이시므로, 주 단위로 빠르게 실행하세요.

(중요!) 일단 먼저 실행하셔야 합니다. 
완벽하게 준비하고 실행하면 계속 늦어지실거예요.

• 1주차: 서비스 패키지 및 가격 확정
• 2주차: 타겟 병원 20곳 리스트업
• 3주차: 콜드 메일/DM 발송 시작
• 4주차: 미팅 진행 + 첫 계약 목표`,

        '3개월': (name) => `3개월 내 시작 목표이시므로, 월 단위로 진행하세요.

• 1개월 차: 강의 수강 및 기반 구축 (서비스, 포트폴리오, 리서치)
• 2개월 차: 영업 시작 (타겟 30곳, 콜드 접근)
• 3개월 차: 첫 고객 확보`,

        '6개월': (name) => `6개월 내 시작 목표이시므로, 충분히 준비하면서 진행하세요.

• 1~2개월 차: 강의 재수강 및 역량 강화 (필사 50건 추천!)
• 3~4개월 차: 기반 구축 (노션 서비스 패키지, 포트폴리오 제작)
• 5~6개월 차: 영업 및 계약`,

        '기본': (name) => `아래 단계를 참고하세요.

• 1단계: 루트 결정 (창업 vs 원고작가)
• 2단계: 서비스 구성, 포트폴리오 준비
• 3단계: 영업 시작, 첫 고객 확보
• 4단계: 레퍼런스 구축, 확장`
    },

    // ----------------------------------------------------------
    // 5️⃣ 후속 지원 (지원 형태별)
    // ----------------------------------------------------------
    closing: {
        '혼자 실행': (name) => `자료만 있으면 혼자 실행 가능하다고 하셨습니다.
위 내용 참고하시고, 막히는 부분 있으면 언제든 연락 주세요.
• 최형기 대표 1:1 채널: https://open.kakao.com/o/sm0Cf1Kh
`,

        '피드백': (name) => `실행 중 피드백을 원하신다고 하셨습니다.
진행 상황 공유해 주시면 피드백 드리겠습니다.
• 최형기 대표 1:1 채널: https://open.kakao.com/o/sm0Cf1Kh
• 조곤 팀장: https://open.kakao.com/me/jogons
`,

        '대행': (name) => `일부 대행 서비스 이용을 희망하신다고 하셨습니다.
필요하신 부분 연락 주시면 안내해 드리겠습니다.

🔑 스마트브랜딩 솔루션 가이드 (스마트브랜딩이 직접 실행사가 되어주는 솔루션) 
https://www.notion.so/25ba4049aa2080089b0dc689913bcc62?pvs=21

`,

        '커뮤니티': (name) => `함께 성장할 커뮤니티를 원하신다고 하셨습니다.
수강생 네트워크 그룹을 안내해 드리겠습니다.

🔑 스마트브랜딩 협력사 네트워크 (스마트브랜딩 외 실행사 공유)
https://www.notion.so/241a4049aa2080aeaff1ef40f429e82a?pvs=21


🔑 광고대행 소통 카톡방

온라인광고대행/실행사
https://open.kakao.com/o/gZcjDAhb

광고홍보 대행사
https://open.kakao.com/o/g67piF1b

자유대화_전문업체대행
https://open.kakao.com/o/gK6nkfVb

블로그 건바이건 의뢰
https://open.kakao.com/o/guidpi4

정보교류방
https://open.kakao.com/o/gizyTg9g

블로그연구소
https://open.kakao.com/o/gSF98uMd

데이터랩툴즈
https://open.kakao.com/o/gWzwc51e

블로그 푸쉬업
https://open.kakao.com/o/gB8Z8bbf

병원마케팅협회
https://open.kakao.com/o/gLEFUWxc

`,

        '기본': (name) => `위 내용 참고하시고, 궁금한 점 있으시면 언제든 연락 주세요.`
    }
};


// ============================================================
// 3. 메일 생성 함수
// ============================================================

/**
 * 메일 제목 생성
 */
function generateMailSubject(name) {
    return CONFIG.mailSubjectTemplate.replace('{name}', name);
}

/**
 * 전체 메일 본문 생성
 */
function generateMailBody(data) {
    const name = data[CONFIG.columns.name];
    const status = data[CONFIG.columns.status];
    const monetization = data[CONFIG.columns.monetization];
    const target = data[CONFIG.columns.target];
    const concern = data[CONFIG.columns.concern];
    const timeline = data[CONFIG.columns.timeline];
    const support = data[CONFIG.columns.support];
    
    // 텍스트 변환
    const statusText = TEXT_MAP.status[status] || status || '준비 중';
    const monetizationText = TEXT_MAP.monetization[monetization] || monetization || '수익화';
    const targetText = target || '';
    const concernText = TEXT_MAP.concern[concern] || concern || '사업 추진';
    
    // 메일 조립
    let mail = '';
    
    // 인사말 + 현황 진단
    mail += generateIntro(name, statusText, monetizationText, targetText, concernText);
    
    // 1️⃣ 방향 제안
    mail += generateSection('1️⃣ 방향 제안', getDirectionContent(name, monetization));
    
    // 2️⃣ 시작점 안내
    mail += generateSection('2️⃣ 시작점 안내', getStartPointContent(name, status));
    
    // 3️⃣ 핵심 솔루션
    mail += generateSection('3️⃣ 핵심 솔루션', getSolutionContent(name, concern));
    
    // 4️⃣ 실행 플랜
    mail += generateSection('4️⃣ 실행 플랜', getActionPlanContent(name, timeline));
    
    // 📞 후속 지원
    mail += generateSection('📞 후속 지원', getClosingContent(name, support));
    
    // 서명
    mail += generateSignature();
    
    return mail;
}

/**
 * 인트로 (인사말 + 현황 진단) 생성
 */
function generateIntro(name, status, monetization, target, concern) {
    // 타겟 문장 조건부 생성
    const isTargetUndecided = !target || target.includes('아직') || target.includes('정하지');
    const targetSentence = isTargetUndecided
        ? `아직 타겟 진료과목은 정하지 않으셨고, ${concern}을 가장 큰 과제로 꼽으셨습니다.`
        : `${target}을 타겟으로 하시며, ${concern}을 가장 큰 과제로 꼽으셨습니다.`;

    return `안녕하세요, ${name}님. ${CONFIG.sender.name}입니다.

'병원 마케팅 대행사 노하우' 과정을 함께해 주셔서 감사합니다.
설문에 응답해 주신 내용을 바탕으로, ${name}님만을 위한 맞춤 컨설팅 리포트를 준비했습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ${name}님 현황 진단
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${name}님께서는 현재 ${status}이시고, ${monetization}을 계획하고 계십니다.
${targetSentence}

`;
}

/**
 * 섹션 생성
 */
function generateSection(title, content) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${content}

`;
}

/**
 * 서명 생성
 */
function generateSignature() {
    return `감사합니다.

${CONFIG.sender.name} 드림
${CONFIG.sender.company} ${CONFIG.sender.title}
${CONFIG.sender.phone}`;
}


// ============================================================
// 4. 컨텐츠 선택 함수 (조건에 따라 적절한 템플릿 선택)
// ============================================================

function getDirectionContent(name, monetization) {
    if (monetization && monetization.includes('대행사 창업')) {
        return MAIL_TEMPLATES.direction['대행사 창업'](name);
    } else if (monetization && monetization.includes('원고작가')) {
        return MAIL_TEMPLATES.direction['원고작가'](name);
    } else if (monetization && monetization.includes('병행')) {
        return MAIL_TEMPLATES.direction['병행'](name);
    } else {
        return MAIL_TEMPLATES.direction['미정'](name);
    }
}

function getStartPointContent(name, status) {
    if (status && status.includes('준비 중')) {
        return MAIL_TEMPLATES.startPoint['준비 중'](name);
    } else if (status && status.includes('대행사 운영')) {
        return MAIL_TEMPLATES.startPoint['운영 중'](name);
    } else if (status && (status.includes('원고작가') || status.includes('프리랜서'))) {
        return MAIL_TEMPLATES.startPoint['활동 중'](name);
    } else if (status && status.includes('부업')) {
        return MAIL_TEMPLATES.startPoint['부업'](name);
    } else {
        return MAIL_TEMPLATES.startPoint['기본'](name);
    }
}

function getSolutionContent(name, concern) {
    if (concern && concern.includes('첫 고객')) {
        return MAIL_TEMPLATES.solution['첫 고객'](name);
    } else if (concern && (concern.includes('서비스') || concern.includes('가격'))) {
        return MAIL_TEMPLATES.solution['서비스/가격'](name);
    } else if (concern && (concern.includes('영업') || concern.includes('제안'))) {
        return MAIL_TEMPLATES.solution['영업/제안'](name);
    } else if (concern && concern.includes('실무 역량')) {
        return MAIL_TEMPLATES.solution['실무 역량'](name);
    } else if (concern && (concern.includes('시간') || concern.includes('병행'))) {
        return MAIL_TEMPLATES.solution['시간 관리'](name);
    } else if (concern && concern.includes('방향')) {
        return MAIL_TEMPLATES.solution['방향'](name);
    } else {
        return MAIL_TEMPLATES.solution['기본'](name);
    }
}

function getActionPlanContent(name, timeline) {
    if (timeline && timeline.includes('1개월')) {
        return MAIL_TEMPLATES.actionPlan['1개월'](name);
    } else if (timeline && timeline.includes('3개월')) {
        return MAIL_TEMPLATES.actionPlan['3개월'](name);
    } else if (timeline && timeline.includes('6개월')) {
        return MAIL_TEMPLATES.actionPlan['6개월'](name);
    } else {
        return MAIL_TEMPLATES.actionPlan['기본'](name);
    }
}

function getClosingContent(name, support) {
    if (support && support.includes('혼자 실행')) {
        return MAIL_TEMPLATES.closing['혼자 실행'](name);
    } else if (support && (support.includes('질문') || support.includes('피드백'))) {
        return MAIL_TEMPLATES.closing['피드백'](name);
    } else if (support && support.includes('대행')) {
        return MAIL_TEMPLATES.closing['대행'](name);
    } else if (support && (support.includes('커뮤니티') || support.includes('네트워크'))) {
        return MAIL_TEMPLATES.closing['커뮤니티'](name);
    } else {
        return MAIL_TEMPLATES.closing['기본'](name);
    }
}
