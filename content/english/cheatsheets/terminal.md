---
title: Terminal & Shell
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/terminal.svg"
description: Master the command line with essential navigation, editing, and history shortcuts for Zsh and Ghostty.
cheatsheet_categories: ["Tools"]
cheatsheet_tags: ["zsh", "ghostty", "cli"]
---

#### 1. Cursor Movement

{{< accordion "Fast Navigation" >}}
* **Ctrl + a**: Jump to the **beginning** of the line.
* **Ctrl + e**: Jump to the **end** of the line.
* **Alt + f**: Move **forward** one word.
* **Alt + b**: Move **backward** one word.
* **Ctrl + xx**: Toggle cursor between start and current position.
{{< /accordion >}}

#### 2. Editing & Deleting

{{< accordion "Text Manipulation" >}}
* **Ctrl + w**: Delete the **word** before the cursor.
* **Alt + d**: Delete the **word** after the cursor.
* **Ctrl + u**: Delete from cursor to **beginning** of line.
* **Ctrl + k**: Delete from cursor to **end** of line.
* **Ctrl + y**: **Yank** (paste) the last deleted text.
* **Ctrl + _**: **Undo** your last edit.
{{< /accordion >}}

#### 3. Command History

{{< accordion "Retrieving Commands" >}}
* **Ctrl + r**: Search command history (triggers Atuin if installed).
* **Alt + .**: Insert the **last argument** of the previous command.
* **!!**: Execute the **entire** last command again (e.g., `sudo !!`).
* **!$**: Execute only the last argument of the previous command.
{{< /accordion >}}

#### 4. Screen Control

{{< accordion "Ghostty & View" >}}
* **Ctrl + l**: Clear the screen.
* **Ctrl + + / -**: Zoom in or out (Ghostty native).
* **Ctrl + 0**: Reset zoom level.
{{< /accordion >}}
