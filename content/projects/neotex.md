+++
title = 'NeoTeX'
subtitle = 'Live LaTeX Preview in Neovim'
summary = 'A Neovim plugin for live LaTeX preview — edit and see compiled output update without leaving your editor.'
date = '2024-12-24'
tags = ["Neovim", "Lua", "Config", "Tools"]
stack = ["Lua"]
draft = false
+++

**Links:** [GitHub](https://github.com/rybkr/neotex)

## Overview

NeoTeX is a Neovim plugin that provides live preview for LaTeX documents. Edit your `.tex` files in Neovim and see the compiled output update in real time, without leaving your editor or manually re-running `pdflatex`.

## Features

- **Live preview**: Document recompiles and refreshes on save or on a configurable debounce interval
- **Neovim-native**: Written in Lua, integrates with Neovim's async job system
- **Error forwarding**: Compilation errors surface directly in Neovim's diagnostics
- **Minimal setup**: Works with existing LaTeX toolchains—just point it at your compiler
