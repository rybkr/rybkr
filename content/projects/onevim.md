+++
title = 'Onevim'
subtitle = 'The Objectively Correct Neovim Config'
summary = "A fast, opinionated Neovim configuration built for C++ and systems programming"
date = '2025-01-15'
draft = false
stack = ["Lua"]
tags = ["Neovim", "Lua", "Config"]
thumbnail = "/images/projects/onevim/thumb.svg"
+++

**Links:** [GitHub](https://github.com/rybkr/onevim)

## Philosophy

Onevim is a Neovim configuration that prioritizes speed, simplicity, and staying out of your way. It's built for developers who want a powerful editor without fighting their tools.

## Features

- **Fast startup**: Lazy-loaded plugins keep startup time under 50ms
- **LSP integration**: Native LSP with clangd, gopls, and lua-language-server preconfigured
- **Fuzzy finding**: Telescope for files, grep, and buffer navigation
- **Git integration**: Gitsigns for inline blame and diff markers
- **Treesitter**: Syntax highlighting and code navigation via treesitter

## Design Decisions

- Minimal plugin count—each plugin earns its place
- Consistent keybindings following Vim conventions
- No fancy UI chrome—focus on the code
- Configuration in plain Lua for transparency and hackability

## Who It's For

Developers working primarily in C++, Go, or Lua who want a fast, reliable editor that doesn't require constant maintenance.
