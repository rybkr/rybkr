+++
title = "Messing with Floating Point"
summary = "A deep dive into IEEE 754 floating point, its quirks, and how to work with it effectively in C++"
date = "2024-11-28"
venue = "Core C++"
location = "Tel Aviv, Israel"
tags = ["C++", "Numerics", "Algorithms"]
video = "https://www.youtube.com/watch?v=ITbqbzGLIgo"
thumbnail = "/images/talks/floating-point-thumb.png"
draft = false
+++

{{< youtube ITbqbzGLIgo >}}

## Abstract

Floating point arithmetic is foundational to scientific computing, graphics, and numerical algorithms—yet most developers treat it as a black box. This talk peels back the abstraction to explore how IEEE 754 floating point actually works, why certain operations produce surprising results, and what strategies exist for writing robust numerical code in C++.

## Topics Covered

- IEEE 754 representation: sign, exponent, mantissa
- Special values: infinities, NaN, denormals
- Precision loss and catastrophic cancellation
- Comparison pitfalls and ULP-based testing
- Compiler optimizations and `-ffast-math` tradeoffs
- Practical techniques for stable numerical algorithms

## Presented At

**Core C++ 2024** — Tel Aviv, Israel
