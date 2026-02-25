---
title: "반도체 및 회로 설계 분야 전체 조망 (MOC)"
date: 2026-02-21
tags: [Overview, Semiconductor, Circuit Design, Study]
---

대학원 진학 및 향후 연구 분야 선정을 위해 반도체와 회로 설계 분야의 전체 지형도를 정리한 문서다. 이 문서는 각 세부 분야의 핵심 개념, 역할, 그리고 다른 영역들과 어떻게 연결되는지를 파악하기 위한 'Map of Content (MOC)' 역할을 한다.

<!-- more -->

---

반도체와 시스템 설계 분야는 크게 **아날로그, 디지털, 메모리, 신호 처리 및 통신, 소자 및 공정, EDA 및 검증**으로 나눌 수 있다. 각 분야는 독립적으로 존재하지 않으며, 거대한 칩(SoC)을 이루기 위해 톱니바퀴처럼 맞물려 돌아간다.

## 1. Analog & Mixed-Signal (아날로그/혼성 신호)

자연계의 연속적인 신호(빛, 소리, 전파 등)를 다루거나 전력을 관리하는 분야.

*   **Analog Circuit Design (아날로그 회로 설계)**: 모든 회로의 기본. Op-Amp 설계, 피드백 이론, 주파수 응답 및 안정성 분석이 핵심이다.
    *   *핵심 개념*: Op-Amp, Negative Feedback, Phase Margin, Noise Analysis, Biasing Techniques.
*   **Mixed-Signal Design (혼성 신호 설계)**: 아날로그와 디지털의 경계. 아날로그 신호를 0과 1로 변환(ADC)하거나 반대로 변환(DAC)하는 회로를 설계한다.
    *   *핵심 개념*: ADC(SAR, Sigma-Delta, Pipeline), DAC, PLL (Phase-Locked Loop), Clock Generation.
*   **RF Circuit Design (고주파 회로 설계)**: 무선 통신 기기(스마트폰, Wi-Fi 공유기 등)의 송수신기를 설계하는 분야. 주파수가 매우 높아 독특한 전송선로 이론과 노이즈 매칭이 필요하다.
    *   *핵심 개념*: LNA (Low Noise Amplifier), Mixer, VCO, Power Amplifier, Impedance Matching.
*   **Power Management IC (PMIC, 전력 관리 회로)**: 배터리 전압을 칩 내부의 각 블록이 필요로 하는 다양한 전압으로 안정적으로 변환하고 공급하는 회로 설계. 스마트폰과 전기차에서 그 중요성이 폭발적으로 증가하고 있다.
    *   *핵심 개념*: LDO, DC-DC Converter (Buck, Boost), Battery Management.

## 2. Digital & VLSI & Architecture (디지털/집적회로/아키텍처)

정보를 0과 1의 논리 연산으로 처리하고, 이를 수억 개의 트랜지스터로 구현하는 분야.

*   **Digital Circuit Design (디지털 하드웨어 설계)**: 논리 게이트를 조합하여 원하는 기능을 수행하는 회로를 설계한다. 주로 Verilog/VHDL 같은 하드웨어 기술 언어(HDL)를 사용한다.
    *   *핵심 개념*: Combinational/Sequential Logic, Finite State Machine (FSM), Timing Analysis.
*   **VLSI Design (초고밀도 집적회로 설계)**: 수많은 하드웨어 블록들을 실제 실리콘 위에 어떻게 배치하고 배선할 것인가(Place & Route)를 다루는 백엔드(Back-end) 설계 분야.
    *   *핵심 개념*: Standard Cell, Floorplanning, Clock Tree Synthesis (CTS), Signal Integrity.
*   **Computer Architecture (컴퓨터 구조)**: 하드웨어의 두뇌인 프로세서가 명령어를 어떻게 효율적으로, 빠르게 처리할 것인지 설계하는 고차원적인 분야.
    *   *핵심 개념*: ISA (RISC-V, ARM), Pipelining, Cache Hierarchy, GPU, Accelerators (NPU).
*   **SoC Design (System-on-Chip)**: CPU, GPU, 메모리 컨트롤러, 모뎀 등 다양한 설계 자산(IP)들을 하나의 거대한 칩으로 엮어내어 칩 전체의 통신 및 시스템 전력을 설계한다.
    *   *핵심 개념*: Bus Protocol (AMBA AXI/AHB), IP Reuse, Power Domain.

## 3. Memory & Emerging Devices (메모리 및 소자)

데이터를 저장하는 곳. 데이터 센터와 AI 반도체 시대를 맞아 단연코 가장 중요한 병목 지점(Bottleneck)이자 핵심 혁신 분야.

*   **Memory Design (메모리 설계)**: SRAM, DRAM, 낸드 플래시 메모리의 셀 구조와 단위 데이터를 어떻게 빠르고 에러 없이 읽고 쓸 수 있는지를 설계.
    *   *핵심 개념*: 1T1C (DRAM), 6T cell (SRAM), Sense Amplifier, Refresh.
*   **Emerging Memory (차세대 메모리)**: 기존 실리콘 기반 메모리의 한계를 극복하려는 새로운 물질과 구조의 메모리. 전원이 꺼져도 정보를 기억하면서도 속도는 DRAM만큼 빠른 이상적인 메모리를 찾기 위한 연구 분야.
    *   *핵심 개념*: MRAM(자기), ReRAM(저항), PCRAM(상변화).
*   **Semiconductor Physics & Process (반도체 물리 및 공정)**: 트랜지스터가 동작하는 본질적인 물리적 원리를 이해(밴드 이론 등)하고, 나노미터 단위의 극초미세 패턴을 깎아내고 쌓는 제조 공정 기술.
    *   *관련 노드*: `[[Semiconductor Physics]]`, `[[CMOS Process]]`
*   **Device Modeling (소자 모델링)**: 물리적 트랜지스터의 동작을 수식으로 만들어, 회로 시뮬레이션 프로그램(SPICE)이 계산할 수 있도록 모델 형태(BSIM 등)로 제공하는 분야.
    *   *관련 노드*: `[[Device Modeling]]`

## 4. Signal Processing & Verification & Layout (신호 처리, 검증, 레이아웃)

*   **Signal Processing & Communication Systems (신호 처리 및 통신)**: 아날로그 신호를 디지털로 바꾼 후, 노이즈를 걸러내고 원하는 정보만 추출하거나 인코딩하는 기술 영역. 물리적인 RF 회로 위에서 돌아가는 필수 알고리즘 체계다.
    *   *관련 노드*: `[[Signal Processing]]`, `[[Communication Systems]]`
*   **Verification & EDA Tools (검증 및 설계 자동화 도구)**: 설계한 칩에 버그가 없는지 소프트웨어적으로 100% 검증해 내는 방법론과, 칩 설계를 도와주는 강력한 소프트웨어 툴(EDA)을 다루는 분야.
    *   *관련 노드*: `[[Verification]]`, `[[EDA Tools]]`
*   **Layout Design (레이아웃 설계)**: 회로도를 실제 실리콘 웨이퍼 위에 그릴 수 있도록 평면적인 물리적 구조(마스크 패턴)로 변환하는 작업. 아날로그 설계에서는 여전히 수작업 레이아웃의 비중과 노하우가 매우 중요하다.
    *   *관련 노드*: `[[Layout Design]]`

---

### 마무리 (대학원 선택 기준)

이 전체 지도는 `[[반도체 회로 설계 맵]]`을 중심으로 펼쳐져 있다. 앞으로 공부하면서 각 노드에 노트를 추가하고, 이 지도 안에서 어떤 영역이 나를 흥미롭게 하는지 지속적으로 탐색해 보자. 

특히 `[[대학원 선택 기준]]` 노트를 통해 내가 시뮬레이션(EDA/Verification)을 좋아하는지, 물리적 구현(Layout/Process)에 관심이 있는지, 아니면 시스템 레벨 구조(Computer Architecture/SoC)에 끌리는지를 파악해 보면 향후 진로를 결정하는 데 큰 도움이 될 것이다.
