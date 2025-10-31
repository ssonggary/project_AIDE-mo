# [솔루션] AIDE 구축 (MO)

### 퍼블리싱

<!-- - ie 11만 대응. (10이하는 고려X);
- 웹 접근성 마크 획득. (wai-aria 사용)
- 개발 전달 형상관리 svn 사용. -->

### 작업환경 설정

- 내부 형상관리는 git, task runner는 gulp 사용.

1. node lts 버전 설치, git 설치
<!-- 2. git clone https://github.com/frameout2020/project._canon-ecommerce-mo -->
2. npm install (node modules package 설치)
3. gulp dev (task runner 걸프 실행)

### 기본 폴더 구조

```bash
.
├── dist/                              # 배포용 폴더
│   └── assets/
│   │    ├── css/
│   │    ├── fonts/
│   │    ├── img/
│   │    └── js/
│   │
│   └── html/
│
│
├── workspace/                          # 퍼블리싱 작업용 폴더
│   └── assets/
│   │    ├── css/
│   │    ├── fonts/
│   │    ├── img/
│   │    │── js/
│   │    └── scss/
│   │          ├── base/
│   │          ├── components/
│   │          ├── layout/
│   │          ├── library/
│   │          └── pages/
│   │
│   └── html/
│         ├── include/                  # include
│         │      ├── componets/         # 컴포넌트s
│         │      └── modal/             # 모달 레이어 팝업
│         │
│         │
│         index.html                    # 퍼블리싱 가이드
│
│
│
# ├── .gitignore
├── gulpfile.js
├── package-lock.json
├── package.json
└── README.md

```

### Git 사용 가이드

1. feature 브랜치를 생성하여 각자 퍼블리싱 작업 진행하고 완료 후 해당 브랜치 push.

- 브랜치명 : feature/작업자이름*날짜*작업내용 ex) feature/홍길동*0415*회원가입

2. 작업이 완료되면 main 브랜치에 merge하여 main branch push.
3. git commit 전에 gulp 종료하고 다시 gulp dev 실행에서 commit 하시기를 추천. (이미지 삭제나 이름변경시 해당 리소스 dist에 미 반영 되기 때문)
