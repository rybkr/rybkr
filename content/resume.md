---
title: "Resume"
layout: "resume"
hideMeta: true
updated: 2026-10-26
---

## Experience

### Database Software Engineer Intern @ Oracle

- May 2026 – August 2026
- Redwood Shores, CA
{.metadata}

- Designed and implemented a resource checker in C to detect resources retained by retiring worker processes, identifying several dozen offending processes for investigation.
- Added an API option to disable Automatic Workload Repository (AWR) report-generation timeouts, resolving missing report sections encountered by the Exadata team.
- Enhanced per-table timeout handling for performance-data flushing during AWR snapshots.

### Embedded Software Engineer Intern @ Matrix

- May 2025 – August 2025
- Newburgh, IN
{.metadata}

- Developed and shipped a deferred logging system in C for FreeRTOS, packing variadic arguments into a compact byte buffer to move formatting work off the calling thread.
- Parallelized CI jobs, reducing pipeline runtime from approximately 2 minutes to 30 seconds per push.
- Built a Python tool to visualize finite state machines by parsing source code into an abstract syntax tree, uncovering multiple state-machine bugs.

## Teaching & Speaking

### Technical Educator, [YouTube](https://www.youtube.com/@rybkr)

- February 2024 – Present
- Ryan Baker
{.metadata}

- Create educational content on Unix, operating systems, low-level programming, and AI systems for 27K+ subscribers, reaching over 1M views.

### Teaching Assistant, Computer Networks

- August 2026 – Present
- Purdue University
- ECE 46300
- West Lafayette, IN
{.metadata}

- Support ~60 students in networking fundamentals through weekly office hours covering internet architecture, routing, and TCP/IP.
- Help students debug C and Python networking assignments involving socket programming, HTTP, and distributed protocols.
- Grade programming assignments and exams.

### Course Instructor, Modern C++

- January 2025 – May 2025
- Purdue IEEE
- West Lafayette, IN
{.metadata}

- Designed and taught a Modern C++ course for 40 students through Purdue IEEE
- Delivered weekly 90-minute lectures from C++ fundamentals through templates, compile-time programming, and safety.
- Authored all course materials, assignments, and assessments.

### Speaker @ Core C++ Conference

- November 2024
- Core C++ Group
- Tel Aviv, Israel
{.metadata}

- Delivered "[Messing with Floating Point](https://youtu.be/ITbqbzGLIgo?si=7hA4Jb8aee5PGkPD)," a 60-minute talk to approximately 100 attendees at Core C++ on types of floating-point error and techniques for mitigating them.

### Teaching Assistant, Linux & Bash

- August 2024 – December 2024
- Purdue IEEE
- West Lafayette, IN
{.metadata}

- Supported 30 students through eight programming assignments covering Bash scripting and Linux fundamentals.
- Reviewed course materials and recommended improvements to explanations and assignment instructions.

## Education

### M.S.E. in Electrical & Computer Engineering @ Purdue

- August 2026 – May 2027 _(expected)_
- West Lafayette, IN
{.metadata}

- Concentration in Artificial Intelligence and Computer Systems

### B.S.E. in Computer Engineering @ Purdue

- August 2023 – May 2026
- West Lafayette, IN
{.metadata}

- Concentration in Computer Systems

## Projects

### [Trillim AI](https://trillim.com)

- December 2025 – Present
{.metadata}

- Co-developed a C++ inference engine using SIMD optimizations, achieving ~1.5-2x the inference speed of Microsoft’s BitNet and llama.cpp for low-bit models.
- Shipped and maintain a Python SDK for downloading and running models locally.
- Added support for image generation models before llama.cpp.

### [Totally](https://totally.sh)

- December 2025 - Present
{.metadata}

- Built a Go CLI that estimates OpenAI and Anthropic agent costs from local transcripts using regularly updated model pricing.
- Implemented cost breakdowns by model, session, time period, and provider to help developers track usage.

### [GitVista](https://gitvista.io)

- October 2025 – Present
{.metadata}

- Built a Git engine in Go and an interactive JavaScript canvas visualizer for exploring repository history, inspecting files at any revision, and analyzing repository activity.
- Designed data transfer between the Go backend and browser to prioritize information needed for the current view while handling large volumes of repository data.
