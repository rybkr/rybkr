---
title: 'Sudoku Generator & Solver (CLI, Go)'
summary: "Command-line Sudoku tool that generates unique puzzles and solves them using backtracking and constraint-based pruning."
date: '2025-10-06'
draft: false
---

## Problem

Most Sudoku tools are either GUI toys or online apps. I wanted a **fast, scriptable command-line tool** that could:

- Generate valid Sudoku puzzles with a **unique solution**
- Offer different difficulty levels
- Solve arbitrary Sudoku boards reliably
- Integrate into scripts, tests, and small tooling workflows

At the same time, I wanted a concrete project to practice **algorithm design, search, and constraint reasoning** in Go.

## Approach

I built a **terminal-based Sudoku tool** in Go that supports both generation and solving from the command line.

- The CLI accepts flags for:
  - `--generate` with optional difficulty (e.g. `easy`, `medium`, `hard`)
  - `--solve` to read a puzzle from stdin or a file
  - `--format` to output in a machine-friendly or human-readable grid
- Internally, the solver uses a **backtracking search** combined with **constraint-based pruning** (row/column/subgrid checks) to cut down the search space.
- The generator creates a full valid board, then removes clues while:
  - Maintaining a **unique solution** (checked by running the solver)
  - Stopping when difficulty constraints are reached (max branching, number of givens, etc.)

## Technical Highlights

- **Backtracking Solver**
  - Depth-first search with early pruning when row/column/subgrid constraints are violated
  - Deterministic behavior with optional seeding for reproducible runs
  - Detects unsolvable or invalid puzzles and exits with a clear error code

- **Puzzle Generation**
  - Starts from a fully solved board generated via the same solver
  - Removes numbers while:
    - Checking that the puzzle still has **exactly one solution**
    - Enforcing minimum clue counts per difficulty tier
  - Uses randomized removal order so generated puzzles are not identical

- **CLI Design**
  - Built with the standard library (no heavy dependencies)
  - Clear usage help and error messages
  - Can read puzzles from:
    - Standard input
    - Text files in a simple 9×9 ASCII format (e.g. `0` or `.` for blanks)

- **Testing & Reliability**
  - Unit tests for:
    - Solver correctness on known puzzles
    - Uniqueness detection
    - Generator invariants (always solvable)
  - Fuzz-style tests that:
    - Generate random puzzles
    - Solve them
    - Re-validate the solved board’s constraints

## Results

- Generates valid Sudoku puzzles with a **guaranteed unique solution**.
- Solves typical puzzles in **milliseconds** on a normal machine.
- Can be used both:
  - Interactively in the terminal  
  - As part of other tools or scripts (e.g. benchmarking, teaching examples, coding exercises)

This project is now my go-to example for:

- Implementing search and constraint algorithms in Go  
- Writing **testable** command-line tools  
- Demonstrating how to move from a simple idea to a robust, scriptable utility

## What I’d Improve Next

- Implement more advanced solving strategies (e.g. naked pairs, X-Wing) to rate difficulty more accurately.
- Expose the core solver as a Go library with a clean API for reuse in other projects.
- Add a `--benchmark` mode to measure solve times across multiple puzzles.
- Optional TUI (text UI) for interactive play without leaving the terminal.

## Links

- GitHub: https://github.com/yourname/sudoku-cli
