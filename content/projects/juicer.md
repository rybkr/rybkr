+++
date = '2024-01-23'
draft = false
title = 'Juicer'
tags = ["C++", "Chess"]
stack = ["C++", "Make"]
subtitle = "Hyper-Performant Chess Move Generator"
summary = "A high-performance chess move generator written in C++ using bitboard techniques"
+++

**Links:** [GitHub](https://github.com/rybkr/juicer)

## Overview

Juicer is a chess move generator focused on raw performance. It generates all legal moves for any given board position using bitboard representations and precomputed attack tables.

## Technical Approach

- **Bitboards**: 64-bit integers represent piece positions, enabling fast bitwise operations for move generation
- **Magic bitboards**: Precomputed lookup tables for sliding piece (rook, bishop, queen) attacks
- **Perft testing**: Move generation correctness verified against known perft results at various depths

## Performance

Move generation is the foundation of any chess engine. Juicer prioritizes speed to enable deeper search in engine development.

## What I Learned

- Low-level optimization techniques in C++
- Bitwise operations for game state representation
- The importance of cache-friendly data structures
