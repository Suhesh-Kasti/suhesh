---
title: "Using Hugo Shortcodes for Enhanced Content"
date: 2024-11-15T10:30:00+05:45
description: "Today I learned how to use Hugo shortcodes to create reusable content snippets and enhance my markdown files."
image: "/images/til/hugo-shortcodes.jpg"
til_categories: ["Hugo"]
til_tags: ["shortcodes", "markdown", "templates"]
draft: false
---

## What are Hugo Shortcodes?

Today I learned about Hugo shortcodes, which are simple snippets of code that can be inserted into markdown content files. They're a powerful way to add complex content or functionality without writing HTML directly in your markdown.

## Basic Syntax

The basic syntax for a shortcode is:

```
{{</* shortcodename parameters */>}}
```

For shortcodes that wrap content:

```
{{</* shortcodename parameters */>}}
  Content to be processed
{{</* /shortcodename */>}}
```

## Built-in Shortcodes

Hugo comes with several built-in shortcodes:

### Figure

The `figure` shortcode is used to add images with captions:

```
{{</* figure src="/images/sample.jpg" title="Sample Image" */>}}
```

### YouTube

Embedding YouTube videos is simple:

```
{{</* youtube w7Ft2ymGmfc */>}}
```

### Gist

You can embed GitHub gists:

```
{{</* gist username gist_id */>}}
```

## Creating Custom Shortcodes

I also learned how to create custom shortcodes. Here's the process:

1. Create a file in the `layouts/shortcodes/` directory
2. Write the template code for your shortcode
3. Use it in your content

For example, a simple alert shortcode might look like:

```html
<!-- layouts/shortcodes/alert.html -->
<div class="alert alert-{{ .Get 0 }}">
  {{ .Inner }}
</div>
```

And you would use it like:

```
{{</* alert "warning" */>}}
This is a warning message!
{{</* /alert */>}}
```

## Why Shortcodes are Useful

Shortcodes help maintain:

- **Consistency**: Ensure elements like callouts or notices look the same across your site
- **Simplicity**: Complex HTML can be reduced to a simple shortcode
- **Maintainability**: Change the appearance of elements site-wide by updating a single shortcode

## Next Steps

I plan to create a set of custom shortcodes for:

- Code examples with syntax highlighting
- Callout boxes for tips, warnings, and notes
- Responsive image galleries
- Custom citation blocks

This will make my content more engaging and easier to maintain in the long run.
