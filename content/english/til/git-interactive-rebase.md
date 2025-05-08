---
title: "Git Interactive Rebase for Cleaning Commit History"
date: 2023-11-25T09:15:00+05:45
description: "Today I learned how to use Git's interactive rebase to clean up my commit history before pushing changes."
image: "/images/til/git-rebase.jpg"
til_categories: ["Git"]
til_tags: ["version-control", "git", "workflow"]
draft: false
---

## Git Interactive Rebase

Today I learned how to use Git's interactive rebase feature to clean up my commit history before pushing changes to a shared repository. This is a powerful tool for maintaining a clean and meaningful commit history.

## What is Interactive Rebase?

Interactive rebase allows you to modify commits in various ways before pushing them. You can:

- Reorder commits
- Edit commit messages
- Combine multiple commits
- Split commits
- Remove commits entirely

## Basic Usage

The basic command is:

```bash
git rebase -i <base>
```

Where `<base>` is the commit or branch you want to rebase onto. Often, you'll use:

```bash
git rebase -i HEAD~n
```

Where `n` is the number of commits you want to include in the rebase.

## The Interactive Rebase Interface

When you run the command, Git opens your default text editor with something like this:

```
pick f7f3f6d Update feature A
pick 310154e Fix typo in feature A
pick a5f4a0d Add feature B
pick 152347a Fix bug in feature B

# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
```

## Common Operations

### Changing Commit Messages

To change a commit message, change `pick` to `reword` (or `r`):

```
pick f7f3f6d Update feature A
reword 310154e Fix typo in feature A
pick a5f4a0d Add feature B
```

Save and close the file, and Git will prompt you to edit the commit message.

### Combining Commits

To combine commits, change `pick` to `squash` (or `s`) or `fixup` (or `f`):

```
pick f7f3f6d Update feature A
squash 310154e Fix typo in feature A
pick a5f4a0d Add feature B
```

This will combine the second commit into the first. With `squash`, you'll be prompted to edit the combined commit message. With `fixup`, it will use the message from the first commit.

### Reordering Commits

Simply change the order of the lines:

```
pick a5f4a0d Add feature B
pick f7f3f6d Update feature A
pick 310154e Fix typo in feature A
```

### Removing Commits

Change `pick` to `drop` (or `d`):

```
pick f7f3f6d Update feature A
drop 310154e Fix typo in feature A
pick a5f4a0d Add feature B
```

## Real-World Example

Today I had a series of commits like:

1. "Add new login form"
2. "Fix typo in login form"
3. "Add validation to login form"
4. "Fix styling issues in login form"

I used interactive rebase to combine them into a single, clean commit:

```
pick abc1234 Add new login form
fixup def5678 Fix typo in login form
fixup ghi9101 Add validation to login form
fixup jkl1121 Fix styling issues in login form
```

The result was a single commit: "Add new login form"

## Caution

Interactive rebase rewrites history, so you should only use it on commits that haven't been pushed to a shared repository. If you've already pushed the commits, you'll need to force push after rebasing, which can cause problems for others.

## Conclusion

Interactive rebase is a powerful tool for maintaining a clean Git history. It allows you to present your changes in a logical, coherent manner, making it easier for others to understand your work.
