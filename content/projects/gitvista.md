+++
title = 'Git Vista'
summary = 'A terminal tool for exploring Git repo history — commit analytics, file churn, and branch visualization without leaving the CLI.'
date = '2025-12-11'
tags = ["Go", "Git", "Tools"]
stack = ["Go", "CLI"]
thumbnail = "/images/projects/gitvista/thumb.png"
wip = true
featured = true
+++

**Links:** [GitHub](https://github.com/rybkr/gitvista)

## Overview

Git Vista is a command-line tool for exploring Git repository history and surfacing useful statistics. It parses the commit graph directly and presents contributor activity, file churn, and branch structure in a readable terminal interface.

## Features

- **Commit analytics**: Frequency, authorship breakdown, and activity over time
- **File churn**: Identify the most frequently modified files across the repo's history
- **Branch visualization**: See divergence and merge patterns at a glance
- **Fast and local**: Reads directly from the `.git` directory—no network calls, no hosted service
