---
title: "Verilog - Module"
date: 2026-03-05
tags: [Verilog, HDL, Module, Logic Circuit Design, Study]
---

Verilog의 기본 설계 단위. 하나의 `module`은 합성 과정을 거쳐 실리콘 위의 물리적 블록이 된다. 큰 chip은 이 module들의 계층 구조로 이루어진다.

<!-- more -->

---

## 🔲 Module이란?

Verilog에서 모든 설계의 기본 단위. C언어의 함수처럼, 입출력을 가지고 특정 기능을 수행하는 독립적인 블록이다.

```verilog
module 모듈이름 (input ..., output ...);
    // 내부 로직
endmodule
```

---

## 🔁 설계 흐름 (Design Flow)

작성한 `module`은 아래 과정을 거쳐 실제 하드웨어가 된다.

```
Module (Verilog 코드)
    ↓ 합성 (Synthesis)
Gate-level netlist (AND, OR, FF 등)
    ↓ Place & Route
실제 FPGA/ASIC 위의 물리적 회로
```

- **Synthesis (합성)**: HDL 코드를 AND, OR, Flip-Flop 같은 논리 게이트 조합으로 변환
- **Place & Route**: 변환된 게이트들을 실제 칩 위에 배치하고 배선
- 즉, `module` 하나 = 실리콘 위의 **물리적 블록** 하나에 대응

---

## 🏗️ 계층 구조 (Hierarchy)

실제 chip은 module들의 트리 구조로 설계된다.

```
Top module
├── CPU core module
│   ├── ALU module
│   ├── Register file module
│   └── ...
├── Memory controller module
└── Peripheral module
```

- **Top module**: 최상위 모듈. 모든 하위 모듈을 연결
- 하위 모듈을 상위 모듈 안에서 사용하는 것을 **인스턴스화(instantiation)** 라고 함
- 계층을 나누면 각 블록을 독립적으로 설계·검증할 수 있어 대규모 설계에 필수적

> HDLBits에서 연습하는 작은 module 하나가, 실제로는 이 계층 구조의 한 조각이다.
