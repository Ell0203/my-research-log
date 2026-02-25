---
title: 📰 Smart News Aggregator (News Bot) 개발
date: 2026-02-16
tags: [Python, Crawling, Telegram, Automation]
---

**Naver Finance**의 주요 뉴스를 실시간으로 수집하고, **Gemini AI**를 통해 내용을 요약 및 분석하여 **Telegram**으로 알림을 보내주는 인공지능 비서 봇입니다. (Project: `02_news_bot`)

*   🎯 **Target**: 네이버 금융 주요 뉴스 & 실시간 속보
*   🤖 **AI Engine**: Google Gemini (gemini-2.5-flash) - 호재/악재 판독 및 3줄 요약
*   📬 **Notification**: 텔레그램 봇 API
*   ⏱️ **Schedule**: 5분 간격 자동 실행

<!-- more -->

## 🏗️ 1. 시스템 아키텍처

이 프로젝트는 크게 **수집(Scraper)**, **저장(Database)**, **AI 분석(AI Enricher)**, **알림(Bot)**, **스케줄링(Scheduler)**의 5가지 모듈로 구성되어 있습니다.

### 🕷️ A. Scraper (`scrapers/naver_finance.py`)
*   `requests`와 `BeautifulSoup`을 사용하여 네이버 금융 뉴스 페이지를 크롤링합니다.
*   ⚠️ **인코딩 이슈**: 네이버 금융이 `euc-kr`을 사용하므로, `response.content.decode('euc-kr', 'replace')`로 디코딩 처리가 되어 있습니다.
*   **로직**:
    1.  목록(`ul.newsList`)에서 기사 제목, 링크, 요약문 추출
    2.  `hashlib.md5(link)`를 사용하여 기사별 고유 ID 생성 (중복 발송 방지)

### 💾 B. Database (`database.py`)
*   **SQLite** (`news_bot.db`)를 사용하여 가볍게 로컬에 데이터를 저장합니다.
*   이미 보낸 기사는 DB에 저장하여, 다음 크롤링 때 중복해서 보내지 않도록 필터링합니다.

### 🤖 C. AI 분석 (`services/ai_enricher.py`)
*   **Google Gemini API** (`gemini-2.5-flash`)를 호출하여 원문 기사를 분석합니다.
*   단순한 줄이기가 아닌 프롬프트 엔지니어링을 통해 **"호재/악재 판도"**, **"핵심 3줄 요약"**, **"판단 근거"** 세 가지를 JSON 형태로 명확히 반환받아 정보의 질을 비약적으로 높입니다.

### 📬 D. Telegram Service (`services/telegram_bot.py`)
*   Telegram Bot API의 `sendMessage` 메서드를 사용합니다.
*   AI가 분석한 호재(📈) 및 악재(📉)에 따라 적절한 이모지를 붙여서 `HTML` 서식으로 가독성 좋게 발송합니다.

### ⏱️ E. Scheduler (`scheduler.py`)
*   Python `apscheduler` 라이브러리를 사용합니다.
*   `BackgroundScheduler`가 메인 프로세스와 별개로 백그라운드에서 주기적으로 크롤링 함수를 실행합니다.

## 💻 2. 핵심 코드 스니펫
가장 핵심이 되는 크롤링 및 중복 검사 로직입니다.

```python
# Unique ID Generation
news_id = hashlib.md5(link.encode()).hexdigest()

# Deduplication Logic
if item['id'] not in seen_ids:
    all_news.append(item)
```

## 📚 3. 배운 점
*   💡 **AI 프롬프팅**: AI 모델에게 단순히 "요약해줘" 보다 "엄격한 JSON 형태로 반환해라, 호재/악재/중립만 판독해라, 이유를 적어라" 같이 명확하게 제약을 거는 시스템 프롬프트가 프로그래밍 연동에 훨씬 효과적임.
*   💡 **인코딩 처리**: 한국 웹사이트 크롤링 시 `utf-8`이 아닌 `euc-kr` 인코딩 처리가 필수적임.
*   💡 **Fallback 설계**: API가 작동하지 않거나 키가 없을 경우를 대비하여 프로그램이 죽지 않고 원본 요약문이라도 내보내는 Fallback(안전 모드) 체계 구축이 필수적임.
