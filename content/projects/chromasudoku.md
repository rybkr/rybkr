+++
title = 'Chroma Sudoku'
summary = 'Color-based Sudoku for embedded hardware'
date = '2025-12-05'
tags = ["Embedded", "C", "Game"]
stack = ["C", "PlatformIO", "RP2350"]
thumbnail = "/images/projects/chromasudoku/thumb.png"
draft = false
featured = true
+++

**Links:** [GitHub](https://github.com/rybkr/ChromaSudoku)\
**Recognition:** *2nd Place*—Purdue SPARK Challenge 2025

*I like sudoku.
I like programming.
Sometimes, I even program sudoku.*

That usually works out—until you try to fit 81 numbers onto a 32×32 RGB LED matrix.

## The Problem

Digital sudoku breaks down at very small scales.
Arabic numerals are pixel-hungry, and at this resolution reading them becomes the main challenge instead of the puzzle itself.

![ChromaSudoku Board](/images/projects/chromasudoku/board.png)

> The image exhibits some exposure effects that do not appear on the physical board.

## The Idea

Instead of digits, **ChromaSudoku** uses **nine distinct colors**.
On a 32×32 RGB matrix, color blocks remain instantly distinguishable without any text rendering.
Each cell maps directly to a color, eliminating glyph complexity while preserving the core logic of Sudoku.

## Implementation

ChromaSudoku runs on an **RP2350** and is written in **C** using **PlatformIO**.  
The grid, input handling, and validation logic are all designed around tight memory and timing constraints typical of embedded systems.

## What I Learned

- Designing interfaces for extreme resolution limits  
- Rethinking familiar problems under hardware constraints  

![ChromaSudoku Complete Device](/images/projects/chromasudoku/device.png)
