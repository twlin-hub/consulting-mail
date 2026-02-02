// config.js - 설정값 모음
// 이 파일에서 스프레드시트 URL, 발신자 정보 등을 관리합니다.

const CONFIG = {
    // 구글 스프레드시트 CSV URL
    sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYS5282LtYxo2yDd2mJPCZP6XvsECsrRrp2bsNM2i9Gw4OyXm-iESv7pBtbo1v1QrzvAxTFBVbZivJ/pub?gid=1253956561&single=true&output=csv',
    
    // 발신자 정보
    sender: {
        name: '최형기',
        company: '스마트브랜딩',
        phone: '010-2824-1794',
        title: '대표'
    },
    
    // 메일 제목 템플릿
    mailSubjectTemplate: '[Smart Branding] {name}님을 위한 병원 마케팅 1:1 컨설팅 리포트',
    
    // 스프레드시트 컬럼명 (구글폼 질문과 매칭)
    columns: {
        name: '📌 수강생 이름',
        email: '🖊️ 이메일 주소',
        course: '🎈 수강 과정',
        timestamp: '타임스탬프',
        status: '강의 후 현재 상황은 어떻게 되시나요?',
        monetization: '어떤 방식으로 수익화를 계획하고 계신가요?',
        target: '주로 타겟하고 싶은 병원 진료과목은 무엇인가요?',
        concern: '현재 가장 큰 고민은 무엇인가요?',
        timeline: '본격적인 활동 시작 목표는 언제인가요?',
        revenue: '목표 월 수익은 얼마인가요?',
        experience: "'병원 마케팅', '대행사 창업'과 관련하여 경험이 있으신가요?",
        support: '앞으로 어떤 형태의 지원을 받고 싶으신가요?',
        sent: '발송완료'
    }
};
