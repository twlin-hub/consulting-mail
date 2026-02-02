# Smart Branding 컨설팅 메일 생성기

구글폼 응답을 기반으로 맞춤 컨설팅 메일을 자동으로 생성하는 웹앱입니다.

---

## 📁 파일 구조

```
consulting-mail/
├── index.html          ← 메인 HTML (구조)
├── css/
│   └── style.css       ← 디자인/스타일
├── js/
│   ├── config.js       ← 설정값 (스프레드시트 URL 등)
│   ├── data.js         ← 데이터 불러오기/파싱
│   ├── mail.js         ← 메일 생성 로직 ⭐ (자주 수정)
│   └── app.js          ← UI 동작/이벤트
└── README.md           ← 이 파일
```

---

## 🔧 수정 가이드

### 컨설팅 문구 수정하기

**파일:** `js/mail.js`

1. `MAIL_TEMPLATES` 객체에서 수정할 섹션 찾기
2. 해당 텍스트 수정
3. 저장 후 GitHub에 업로드

**예시: "방향 제안" 문구 수정**

```javascript
// js/mail.js 파일에서

MAIL_TEMPLATES = {
    direction: {
        '대행사 창업': (name) => `여기 문구를 수정하세요...`,
        // ...
    }
}
```

---

### 발신자 정보 수정하기

**파일:** `js/config.js`

```javascript
sender: {
    name: '최형기',        // 이름
    company: '스마트브랜딩', // 회사명
    phone: '010-2824-1794', // 연락처
    title: '대표'           // 직함
}
```

---

### 스프레드시트 URL 변경하기

**파일:** `js/config.js`

```javascript
sheetUrl: '여기에 새 URL 붙여넣기'
```

---

### 디자인 수정하기

**파일:** `css/style.css`

- 색상: `#667eea` (메인 보라색) 검색해서 변경
- 폰트 크기: `font-size` 검색해서 변경
- 여백: `padding`, `margin` 검색해서 변경

---

## 📤 GitHub 업로드 방법

### 처음 업로드 (전체 파일)

1. GitHub 저장소 접속
2. "Add file" → "Upload files"
3. 폴더 전체를 드래그 앤 드롭
4. "Commit changes" 클릭

### 파일 수정 후 업데이트

1. 수정할 파일 클릭 (예: `js/mail.js`)
2. 연필 아이콘 (Edit) 클릭
3. 내용 수정
4. "Commit changes" 클릭

---

## ✅ 발송완료 표시 방법

1. 구글 스프레드시트 열기
2. **O열** (발송완료 컬럼)에 **"O"** 입력
3. 웹앱에서 "새로고침" 클릭
4. 해당 응답자가 "발송완료"로 표시됨

---

## 🔗 접속 주소

```
https://twlin-hub.github.io/consulting-mail/
```

---

## 📞 문의

최형기 / 스마트브랜딩
010-2824-1794
