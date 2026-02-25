---
title: "신규 프로젝트 아이디어: 로컬 마크다운 노트 챗봇 (Local RAG)"
date: 2026-02-22
tags: [Idea, AI, RAG, Markdown, LLM]
---

새롭게 진행해 볼 만한 비(非)주식 도메인의 개인 프로젝트 아이디어 정리.

## 🧠 개인 맞춤형 마크다운 노트 챗봇 (Local RAG for Second Brain)

### 📌 개요
현재 작성 중인 `03_research_log`, `04_knowledge_graph`에 쌓인 마크다운 문서들을 벡터 DB에 임베딩하여, "내가 예전에 이 개념에 대해 뭐라고 정리했지?" 등의 질문을 던지면 내 과거 기록을 기반으로 답해주는 검색형 AI 비서.

### 🛠️ 기술 스택
- **RAG 프레임워크**: `LangChain` 또는 `LlamaIndex`
- **벡터 데이터베이스**: `ChromaDB` (로컬 파일 시스템에 저장하기 용이)
- **임베딩/LLM 모델**: 텍스트 임베딩 모델 연동 + 질문 응답을 생성할 `Gemini API` 
- **프론트엔드 UI**: 간단한 프로토타이핑을 위한 `Streamlit`

### 🚀 코딩 진행 방향
1. **문서 로딩 및 전처리 (`loader.py`)**:
   - `DirectoryLoader`나 `UnstructuredMarkdownLoader`를 활용해 마크다운의 구조(헤더 단위)를 보존하며 문서를 작은 조각(Chunk)으로 분산.
   - 링크(`[[]]`) 포맷이나 프론트매터(Frontmatter) 등 불필요한 메타 기호 필터링.
2. **임베딩 파이프라인 (`indexer.py`)**:
   - 분리된 문서 청크들을 임베딩 모델로 돌려 벡터값으로 변환하고, ChromaDB에 저장. (문서가 수정/추가될 때만 업데이트되도록 관리 요소 필요)
3. **챗봇 인터페이스 (`app.py`)**:
   - Streamlit으로 채팅창 UI 구성.
   - 사용자가 질문하면 DB에서 가장 유사도가 높은 청크들을 찾아낸(Retriever) 뒤, 이를 프롬프트의 컨텍스트(Context)로 주입하여 LLM이 자연스러운 요약 답변과 원문 링크(출처)를 제시하도록 구현.
