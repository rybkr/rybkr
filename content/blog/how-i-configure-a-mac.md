---
title: "How I configure a Mac"
date: 2026-11-11
description: "My Mac setup: system settings, keyboard remapping, and the apps I use."
---

## System Settings

### Desktop & Dock

I **put the Dock on the left side** of the screen and **enable automatic hiding**.
The dock is still there when I need it, but doesn't occupy and precious screen real estate otherwise.

I **hide items on my desktop**, too.
This doesn't alter or delete any files, it only stops showing their icons over the wallpaper.
I prefer to locate and open files either through the command line or via Finder.

### Menu Bar

I set the menu bar to hide automatically.
Like the Dock, it stays available when I move the pointer to it, but it doesn’t occupy screen space the rest of the time.
## Keymappings

Caps lock is a useless key. Map it to something else.
I map it to control. This, in addition to changing my Tmux leader key to 'A', makes Tmux a joy to use, since CAPS and A are right next to one another.

## Raycast

I use [Raycast](https://www.raycast.com/) as my launcher. Open it, type the name of an application, and press Enter. That pairs well with a hidden Dock: launching an application doesn't require finding its icon first.

Raycast also supports extensions, so the same interface can expose commands from other tools. But launching applications is a useful place to start. You don't need to configure every feature before using it.

## Stats

[Stats](https://github.com/exelban/stats) puts system information in the menu bar. It can display CPU and memory usage, network activity, and other measurements without requiring a separate monitoring window.

That gives you some context when the computer is busy. High CPU usage and network activity tell you different things, even if both look like an application making you wait. The numbers won't explain every slowdown, but they're more informative than guessing.

## Rectangle

I use [Rectangle](https://rectangleapp.com/) to move and resize windows with keyboard shortcuts.

Putting two windows next to each other should be a simple operation: one on the left, one on the right. Rectangle lets you assign those positions directly instead of dragging window edges until they look approximately correct.

This is especially useful when working between a terminal and documentation. Give each window its space and get back to what you were doing.

## Ghostty

[Ghostty](https://ghostty.org/) is my terminal.

The terminal and the shell are separate programs. Ghostty provides the window, displays terminal output, and passes input to the program running inside it. Your shell interprets the commands you enter. Changing the terminal doesn't mean you need to change the shell too.

## Firefox

[Firefox](https://www.firefox.com/) is my browser. Set it as the default browser as well, so opening a link from another application sends it to the same place.

With that, the basic setup is in place: Raycast to launch applications, Rectangle to arrange them, Stats to see what the system is doing, and Ghostty and Firefox for the terminal and browser.
