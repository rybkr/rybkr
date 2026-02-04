+++
title = 'Markee'
subtitle = 'Minimal Markdown Parser'
summary = 'A zero-dependency Markdown parser written from scratch in Go, focused on the subset of Markdown people actually use.'
date = '2025-10-01'
tags = ["Go", "Tools"]
stack = ["Go"]
wip = true
draft = false
+++

**Links:** [GitHub](https://github.com/rybkr/markee)

## Overview

Markee is a from-scratch Markdown parser written in Go. It converts Markdown text to HTML without pulling in external dependencies, focusing on correctness and simplicity over spec completeness.

## Motivation

Most Markdown libraries are either massive (full CommonMark/GFM implementations) or tightly coupled to a specific framework. Markee aims to be a small, embeddable parser that handles the subset of Markdown people actually use—headings, lists, emphasis, code blocks, links, and images—without the weight.

## Approach

- **Hand-written lexer and parser**: No regex chains or third-party parsing libraries
- **Stream-based**: Processes input incrementally rather than loading entire documents into memory
- **Zero dependencies**: Standard library only
