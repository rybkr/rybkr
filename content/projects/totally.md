+++
title = 'Totally'
subtitle = 'Local Agent Session Analytics'
summary = 'A local CLI for finding agent sessions, inspecting transcript provenance, and estimating token usage and cost.'
date = '2026-07-12'
rank = 0
tags = ["Go", "Tools"]
stack = ["Go", "CLI"]
wip = true
+++

**Links:** [Website](https://totally.sh) · [GitHub](https://github.com/rybkr/totally)

## Overview

Totally is a local command-line tool for understanding agent sessions: what was worked on, how much usage and estimated cost they incurred, and where the underlying transcripts live.

## What It Does

- **Browse sessions:** Find sessions by working directory, time range, model, provider, or prompt
- **Inspect activity:** See prompts, turns, tool calls, duration, token use, and transcript provenance for a session
- **Compare usage:** Aggregate sessions by project, model, provider, or time period
- **Keep pricing explicit:** Estimate costs from a local, versioned price table rather than treating estimates as invoices

Totally reads supported local agent data directly, so it can be useful without sending session history to another service.
