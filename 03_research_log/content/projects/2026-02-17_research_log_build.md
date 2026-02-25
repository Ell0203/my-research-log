---
title: 🌐 ResearchLog 구축기 및 업데이트 타임라인
date: 2026-02-20
tags: [Web, Architecture, Flask, Markdown, Update]
---

**Personal Research Archive**를 구축하기 위해 Static Site의 간결함과 Dynamic App의 편의성을 결합한 **Hybrid Architecture**를 설계하고 구현했습니다. 최근 검색 기능 및 태그 필터링 등 사용자 편의성 기능이 추가되었습니다.

<!-- more -->

## 🚀 버전 타임라인

### v1.1 업데이트 (2026-02-20)
- 🔍 **클라이언트 사이드 실시간 검색**: 단축키 `/` 지원 및 입력 즉시 로컬에서 결과값을 바로 보여주는 검색 기능 (검색어 하이라이팅 포함)
- 🏷️ **태그 필터링 추가**: 전체 항목 보기 및 각 섹션에서 태그 필터 바(Tag Filter Bar)를 활용해 문서를 직관적으로 분류
- ✨ **사용자 경험(UI/UX) 개선**: 긴 문서 스크롤 시 상단에 읽기 진행률(Reading Progress Bar) 표시, `Esc` 키로 검색 빠져나오기 지원

### v1.0 구축 (2026-02-17)
- ⚙️ **Core**: Python Flask Server + Vanilla JS Frontend 기반 Hybrid Architecture
- 💾 **Data**: Markdown Files (제로-데이터베이스 구조)
- 📝 **기능**: 폴더에 파일을 넣으면 자동으로 Frontmatter가 파싱되어 사이트에 포스팅되는 워크플로우 적용
- 🎨 **디자인**: 모바일 퍼스트 프론트엔드, 고대비 다크 모드(High-Contrast Dark Mode) 및 네온 그린 강조 컬러 도입

---

## 🎯 프로젝트 목표
복잡한 CMS(WordPress 등)나 무거운 프레임워크(React/Next.js) 없이, **"가장 빠르고 간편하게"** 기록을 남길 수 있는 나만의 공간을 만드는 것이 목표였습니다.

## 🏗️ 아키텍처 발전 과정

### 📄 Phase 1: Static Site (Pure HTML/JS)
처음에는 `data.js`라는 JSON 파일에 모든 글을 적어넣는 방식을 시도했습니다.
*   ✅ **장점**: 서버가 필요 없음. 브라우저에서 바로 열림.
*   ❌ **단점**: 글을 쓸 때마다 JSON 문법(`{, }, "`)을 지켜야 해서 매우 불편함.

### ⚡ Phase 2: Hybrid (Flask + Markdown)
"폴더에 메모장(Markdown) 파일을 던져넣으면 알아서 사이트에 떴으면 좋겠다"는 니즈를 실현하기 위해 Python Flask를 도입했습니다.

1.  🖥️ **Backend (`app.py`)**: `content/` 폴더 내의 `.md` 파일들을 스캔하고, HTML로 변환하여 API로 제공합니다.
2.  🌐 **Frontend (`app.js`)**: API에서 데이터를 받아와 화면에 렌더링합니다.
3.  📂 **Content**: 각 폴더(`projects`, `ideas` 등)에 마크다운 파일만 관리하면 됩니다.

## 🛠️ 핵심 기술 스택
*   **Backend**: Python 3.13, Flask, Python-Frontmatter
*   **Frontend**: HTML5, CSS3 (Variables for Dark Mode), Vanilla JavaScript
*   **Design**: High-Contrast Dark Mode (Neon Green Accent)
