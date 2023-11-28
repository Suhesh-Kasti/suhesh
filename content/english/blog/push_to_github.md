---
title: Push to Github
meta_title: "Push to github"
description: "How to push your code to Github?"
image: "/images/portfolio/wireshark.png"
categories: ["Version Control"]
author: "Suhesh Kasti"
tags: ["Git", "Github"]
date: 2023-09-21T22:18:55+05:45
draft: false
---
{{< toc >}}

GitHub is a popular platform for hosting and collaborating on software development projects. If you're new to GitHub and want to learn how to push your code to a repository, you're in the right place. In this guide, we'll walk you through the process step by step.

## Prerequisites

Before you get started, make sure you have the following:

- A GitHub account (if you don't have one, you can [sign up here](https://github.com/join))
- Git installed on your local machine (you can download it [here](https://git-scm.com/downloads))

## Step 1: Create a GitHub Repository

1. Log in to your GitHub account.
2. Click on the **+"** icon in the upper right corner and select **"New repository"** from the dropdown menu.

![Create Repository](https://example.com/images/create-repo.png)

3. Fill in the repository name, description, and choose other settings as needed.
4. Click **"Create repository"** to create your new repository.

## Step 2: Clone the Repository

Now that you have a repository, you'll need to clone it to your local machine.

1. Click on the **"Code"** button in your repository's main page.
2. Copy the repository URL.

![Clone Repository](https://example.com/images/clone-repo.png)

3. Open your terminal and navigate to the directory where you want to store your project.
4. Use the `git clone` command to clone the repository:

```bash
git clone <repository-url>
```

Replace `<repository-url>` with the URL you copied from GitHub.

## Step 3: Make Changes to Your Code

Now, you can start making changes to your code inside the cloned repository on your local machine. Once you're done making changes, follow these steps to push your code to GitHub.

## Step 4: Add and Commit Changes

1. Use the `git status` command to see the changes you've made:

```bash
git status
```

2. To stage your changes for commit, use the `git add` command:

```bash
git add .
```

The period `.` means to add all changes. You can replace it with specific file names if needed.

3. Commit your changes with a descriptive message:

```bash
git commit -m "Your commit message here"
```

## Step 5: Push Changes to GitHub

1. Push your committed changes to GitHub using the `git push` command:

```bash
git push origin main
```

This assumes you're pushing to the `main` branch. If you're working on a different branch, replace `main` with the branch name.

2. Enter your GitHub username and password if prompted.

## Step 6: Verify Your Changes

Visit your GitHub repository in a web browser, and you should see your changes reflected there.

Congratulations! You've successfully pushed your code to GitHub.

Now you know the basic steps to push your code to a GitHub repository. As you continue to work on your projects, you'll become more familiar with Git and GitHub, and you can explore more advanced features like branching, pull requests, and collaboration with others.

Happy coding! 🚀

