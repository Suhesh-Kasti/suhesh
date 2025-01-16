---
title: Git
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/git.svg"
description: is a distributed version control system for tracking changes in code and coordinating work among multiple developers.
---

#### 1. Clone

{{< accordion "git clone: Clone a repository into a new directory" >}}
Clone a Git repository from a remote source to your local machine.
<br>

```bash
git clone repository_url
```

{{< /accordion >}}

#### 2. Init

{{< accordion "git init: Create an empty Git repository or reinitialize an existing one" >}}
Initialize a new Git repository for a project or reinitialize an existing one.
<br>

```bash
git init
```

{{< /accordion >}}

#### 3. Add

{{< accordion "git add: Add file contents to the index for the next commit" >}}
Stage changes for the next commit by adding modified or new files.
<br>

```bash
git add file_name
```

{{< /accordion >}}

#### 4. Commit

{{< accordion "git commit: Record changes to the repository" >}}
Save staged changes to the local repository with a descriptive commit message.
<br>

```bash
git commit -m "Your commit message"
```

{{< /accordion >}}

#### 5. Status

{{< accordion "git status: Show the working tree status" >}}
View the status of your working directory and see changes that need to be committed.
<br>

```bash
git status
```

{{< /accordion >}}

#### 6. Diff

{{< accordion "git diff: Show changes between commits, commit and working tree, etc" >}}
Display the differences between various states, such as commits and the working tree.
<br>

```bash
git diff
```

{{< /accordion >}}

#### 7. Log

{{< accordion "git log: Show the commit logs" >}}
View a chronological log of commits with their hashes, authors, dates, and messages.
<br>

```bash
git log
```

{{< /accordion >}}

#### 8. Branch

{{< accordion "git branch: List, create, or delete branches" >}}
Manage branches in your Git repository - list, create, or delete branches.
<br>

```bash
git branch branch_name
```

{{< /accordion >}}

#### 9. Checkout

{{< accordion "git checkout: Switch branches or restore working tree files" >}}
Move between branches or restore files to a previous state.
<br>

```bash
git checkout branch_name
```

{{< /accordion >}}

#### 10. Merge

{{< accordion "git merge: Join two or more development histories together" >}}
Combine changes from different branches into the current branch.
<br>

```bash
git merge branch_name
```

{{< /accordion >}}

#### 11. Remote

{{< accordion "git remote: Manage set of tracked repositories" >}}
Configure connections to remote repositories where your code is stored.
<br>

```bash
git remote add origin repository_url
```

{{< /accordion >}}

#### 12. Fetch

{{< accordion "git fetch: Download objects and refs from another repository" >}}
Retrieve changes from a remote repository without merging them into your working directory.
<br>

```bash
git fetch origin
```

{{< /accordion >}}

#### 13. Pull

{{< accordion "git pull: Fetch from and integrate with another repository or a local branch" >}}
Fetch changes from a remote repository and integrate them into your current branch.
<br>

```bash
git pull origin branch_name
```

{{< /accordion >}}

#### 14. Push

{{< accordion "git push: Update remote refs along with associated objects" >}}
Send your committed changes to a remote repository.
<br>

```bash
git push origin branch_name
```

{{< /accordion >}}

#### 15. Reset

{{< accordion "git reset: Reset current HEAD to the specified state" >}}
Unstage changes or move the current branch to a specific commit.
<br>

```bash
git reset commit_hash
```

{{< /accordion >}}

#### 16. Revert

{{< accordion "git revert: Create new commit that undoes changes to the previous commit" >}}
Reverse the changes introduced by a specific commit by creating a new commit.
<br>

```bash
git revert commit_hash
```

{{< /accordion >}}

#### 17. Tag

{{< accordion "git tag: Create, list, delete, or verify a tag object signed with GPG" >}}
Mark specific commits as releases by creating lightweight or annotated tags.
<br>

```bash
git tag -a v1.0 -m "Release version 1.0"
```

{{< /accordion >}}

#### 18. Cherry-Pick

{{< accordion "git cherry-pick: Apply the changes introduced by some existing commits" >}}
Select and apply specific commits from one branch to another.
<br>

```bash
git cherry-pick commit_hash
```

{{< /accordion >}}

#### 19. Stash

{{< accordion "git stash: Stash the changes in a dirty working directory away" >}}
Temporarily save changes that are not ready to be committed.
<br>

```bash
git stash save "Your stash message"
```

{{< /accordion >}}

#### 20. Help

{{< accordion "git help: Display help information" >}}
Access Git's built-in documentation to get information about Git commands.
<br>

```bash
git help command_name
```

{{< /accordion >}}
