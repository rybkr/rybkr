+++
title = 'VimSlides'
subtitle = 'Markdown to Slideshow in Neovim'
summary = 'A Neovim plugin that turns Markdown files into terminal slideshows — no browser, no export step.'
date = '2024-12-20'
tags = ["Neovim", "Lua", "Config", "Tools"]
stack = ["Lua"]
draft = false
+++

**Links:** [GitHub](https://github.com/rybkr/vimslides)

## Overview

VimSlides is a Neovim plugin that turns a Markdown file into a slideshow you can present directly from your terminal. Write your slides in plain Markdown, split by headings, and navigate them with keybindings—no browser, no Electron app, no export step.

## Features

- **Markdown-native**: Slides are just Markdown sections separated by headings
- **In-terminal presentation**: Full-screen slide display without leaving Neovim
- **Keyboard navigation**: Step forward and back through slides with simple keybindings
- **Syntax highlighting**: Code blocks retain Treesitter highlighting during presentation
