+++
title = 'Sudoku Generator & Solver'
summary = "A command-line Sudoku generator and solver in Go — built so I'd never need to buy another puzzle book."
date = '2025-10-06'
tags = ["Tools"]
stack = ["Go", "CLI"]
thumbnail = "/images/projects/sudoku/thumb.png"
draft = false
+++

**Links:** [GitHub](https://github.com/rybkr/sudoku)

## The Problem

I wanted an ample supply of Sudoku puzzles for road trips and flights, without buying a book or relying on online generators.
Most existing tools are GUIs or web apps.
I wanted a **portable CLI tool** that could generate puzzles, control difficulty, and render them to HTML for easy printing.

## Approach

I built a terminal-based Sudoku generator and solver in Go.

```bash
sudoku gen --clueCount=17-80 --number=10 --output=out.html
```

The solver uses backtracking with constraint-based pruning to efficiently search valid boards.
The generator starts from a solved grid and removes clues while repeatedly verifying unique solvability by re-running the solver.
