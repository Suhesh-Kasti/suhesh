---
title: "Deploying to Cloudflare"
meta_title: "Cloudflare pages"
description: "If you are a beginner frontend developer, this is a goldmine for you. Host your website projects for free in cloudflare pages easily and shine infront of your competition in recruitments."
date: 2024-02-25T20:53:06+05:45
image: "/images/blog/deployment/cloudflare/hosting.jpg"
categories: ["Web development"]
author: "Suhesh Kasti"
tags: ["Static sites", "Hosting", "Deployment"]
buttons:
  - label: "Goto Cloudflare's Site"
    url: "https://dash.cloudflare.com/"
  - label: "View Cloudflare Pages Documentation"
    url: "https://developers.cloudflare.com/pages/"
---

# Deploying a Static Site to Cloudflare Pages

## What is a Static Site?

In the world of web development, static sites have been gaining popularity in recent years. A static site is a website where the content is pre-rendered and served as-is to the user, without any dynamic server-side processing. This means that the content of the pages doesn't change based on user input or interaction.

Static sites are typically faster and more secure than dynamic websites, as they don't require a server-side scripting language (like PHP, Ruby, or Python) to generate the pages on the fly. Instead, the entire site is pre-built and stored as HTML, CSS, and JavaScript files, which can be efficiently delivered to the user's browser.

This simplicity also makes static sites easier to maintain and scale. Content updates can be as straightforward as pushing changes to a version control system, like Git, and then re-deploying the site. Static sites are, therefore, an excellent choice for many types of web projects, including blogs, company websites, portfolio sites, and even small web applications.

## What Can and Can't be Hosted for Free on Cloudflare Pages?

Cloudflare Pages is a powerful and easy-to-use platform that allows you to host your static sites for free. This makes it an attractive option for developers and individuals who are looking to build and deploy their web projects without incurring significant hosting costs.

The free plan offered by Cloudflare Pages comes with some notable features and limitations:

**Features:**
- **Continuous Deployment**: Cloudflare Pages automatically deploys your site whenever you push changes to your Git repository, making it easy to keep your site up-to-date.
- **Global CDN**: Your static site is served from Cloudflare's global content delivery network (CDN), ensuring fast load times for your visitors.
- **SSL/HTTPS**: Cloudflare Pages provides free SSL/HTTPS support, so your site can be served securely.
- **Custom Domains**: While the free plan only supports subdomains of `*.pages.dev`, you can use your own custom domain if you upgrade to a paid plan.

**Limitations:**
- **Bandwidth Limit**: The free plan has a monthly bandwidth limit of 100GB, which may be sufficient for many small to medium-sized static sites.
- **Build Minutes**: The free plan comes with a monthly build time limit of 500 minutes, which is the amount of time Cloudflare Pages can spend building your site during deployments.
- **Custom Domains**: As mentioned, the free plan only supports subdomains of `*.pages.dev`. If you want to use your own custom domain, you'll need to upgrade to a paid plan.

It's important to note that the free plan is well-suited for hosting simple, static websites. If you have more advanced requirements, such as increased bandwidth or custom domain support, you may need to consider upgrading to one of Cloudflare's paid plans.

## Deploying Your Static Site on Cloudflare Pages

Deploying your static site on Cloudflare Pages is a straightforward process, even for users with no prior experience. Here's a step-by-step guide to help you get started:

> For this demonstration, I have used this very unique [gallery application](https://github.com/Sped0n/bridget) made using Solid Js and Hugo.

1. **Create a Public Repository**: Your static site must be in a public repository on GitHub or GitLab. This is a requirement for the free Cloudflare Pages plan. If you want help on how to push your code to GitHub, I have got you covered, just [click here](https://suhesh.com.np/blog/github-basics-1/).

2. **Open the Cloudflare Dashboard**: Log in to your Cloudflare account and navigate to the dashboard.
   ![Cloudflare Dashboard](/images/blog/deployment/cloudflare/dashboard.png)

3. **Click "Create a Project"**: This will start the process of setting up your new static site project.

   ![Create a Project](/images/blog/deployment/cloudflare/create-project.png)

4. **Click on "Workers" and then "Pages"**: This will take you to the Cloudflare Pages section of the dashboard.

   ![Cloudflare Pages](/images/blog/deployment/cloudflare/pages.png)

   **Connect to Your Git Repository**: Click the "Connect to Git" button and select the platform (GitHub or GitLab) where your site's repository is hosted.

5. **Choose Your Repository**: Select the repository where your static site is located.

   ![Choose Repository](/images/blog/deployment/cloudflare/choose-repo.png)

6. **Configure Your Project**: Cloudflare Pages will try to automatically detect the type of framework your site is built with. You can choose a different framework preset if needed.

   ![Configure Project](/images/blog/deployment/cloudflare/configure-project.png)

   **Click "Deploy"**: This will start the deployment process, and your site will be available at a Cloudflare Pages subdomain (e.g., `your-site.pages.dev`).

7. **Deployed**: If your application is deployed without any errors, it should be available under the domain `YOUR_PROJECT_NAME.pages.dev` in a few moments. You can continue to your project.
   ![Deployed](/images/blog/deployment/cloudflare/deployed.png)

During the deployment process, Cloudflare Pages will fetch the code from your Git repository, build your site according to the selected framework preset, and then publish the generated files to its global CDN.

8. **Handling Deployment Errors**:

   Sometimes, the deployment may fail due to various reasons. Here are some common errors you might encounter and how to handle them:

   ![Error](/images/blog/deployment/cloudflare/error.png)

   a. **Error in Code - Build Failed**:
      If there are issues in your code, the deployment process may fail during the build step. In this case, you can fix the errors in your code, push the changes to your Git repository, and then manually retry the deployment by clicking the "Retry Deployment" button.

   b. **Large File Size Exceeds Limit**:
      Cloudflare Pages has a file size limit, and if your site includes large files (such as high-resolution images or videos), the deployment may fail. To resolve this, you can optimize your assets or consider using a content delivery network (CDN) to serve the large files.

   c. **Unknown Error: Manual Rebuild Fixes It**:
      Occasionally, you may encounter an unknown error during the deployment process. In such cases, manually retrying the deployment by clicking the "Retry Deployment" button may resolve the issue.

   d. **Other Errors**:
      Depending on the nature of the error, you may need to consult the deployment logs or seek help from the Cloudflare support team to troubleshoot the issue.

During the deployment process, you can view the deployment logs by clicking on the "Deployments" tab in the Cloudflare Pages section of the dashboard. This can help you identify and troubleshoot any issues that may arise.

   ![Available](/images/blog/deployment/cloudflare/available.png)

Once the deployment is complete, you'll be able to access your static site at the provided Cloudflare Pages subdomain. If you need to update your site, simply push your changes to your Git repository, and Cloudflare Pages will automatically rebuild and redeploy your site.

## Supported Frameworks

Cloudflare Pages supports a wide range of static site frameworks and generators, making it a versatile platform for hosting various types of web projects. Here's a table with some of the most popular options:

| Framework | Description |
| --- | --- |
| **Angular CLI** | A command-line tool for building and managing Angular applications. It provides a complete workflow to develop, test, and deploy Angular apps. |
| **Astro** | A new static site builder that aims to provide a better developer experience by focusing on simplicity, performance, and developer ergonomics. Astro supports server-side rendering (SSR) and island architecture for improved interactivity. |
| **Brunch** | A fast, opinionated, and battery-included build system for modern web applications. It's well-suited for building static sites with its simple configuration and asset pipeline. |
| **Create React App** | A popular React-based framework for building single-page applications (SPAs). Create React App provides a modern, opinionated setup for building React apps, making it easy to get started with a React-powered static site. |
| **Docusaurus** | A React-based framework for building documentation websites. It provides a set of tools and plugins to help you create and maintain documentation websites easily. |
| **Elder.js** | A framework for building high-performance, SEO-friendly websites and web applications using Svelte and Node.js. It's designed to be a full-stack solution for building static sites. |
| **Eleventy (11ty)** | A versatile static site generator that can be used with various templating languages, such as Liquid, Nunjucks, and Markdown. Eleventy is known for its simplicity and flexibility. |
| **Gatsby** | A React-based framework for building blazing-fast websites and web applications. Gatsby is known for its performance optimizations, such as code splitting and server-side rendering, making it a great choice for building static sites. |
| **Gitbook** | A documentation and book creation tool that allows you to write your content in Markdown and convert it into beautiful books, websites, PDFs, and more. It's a popular choice for creating and hosting technical documentation. |
| **Gridsome** | A Vue.js-powered static site generator for building fast and secure websites and web applications. It's designed to be SEO-friendly and provides a GraphQL-based data layer for building complex sites. |
| **Hugo** | A fast and modern static site generator written in Go. Hugo is known for its lightning-fast build times and extensive set of features, making it a popular choice for building static sites. |
| **Jekyll** | A popular static site generator written in Ruby. Jekyll is a widely-used tool for building blogs and other content-heavy static sites. |
| **Mcdocs** | A static site generator built on top of Markdown and Vue.js, designed for creating technical documentation. It provides a simple and intuitive way to build and publish documentation websites. |
| **Next.js** | A React framework that supports both server-side rendering (SSR) and static site generation (SSG). Next.js allows you to build hybrid applications that can leverage both server-rendered and statically-generated pages. |
| **Next.js (Static Site)** | Next.js can also be used to build pure static sites, where all pages are pre-rendered at build time and served as static HTML files. This approach provides the benefits of server-side rendering while maintaining the speed and simplicity of a static site. |
| **Nuxt.js** | A Vue.js framework for building universal (isomorphic) applications. Nuxt.js provides a complete solution for building server-rendered Vue.js applications, as well as static site generation. |
| **Pelican** | A static site generator written in Python that is well-suited for building blogs and other content-heavy websites. It provides a simple and efficient way to manage and publish content. |
| **Quik** | A minimalist static site generator that focuses on simplicity and developer productivity. It's designed to be easy to use and configure, making it a good choice for small to medium-sized static sites. |
| **React Static** | A framework for building lightning-fast, offline-ready React websites and applications. It leverages modern web development tools and techniques to deliver highly optimized static sites. |
| **Remix** | A full-stack web framework that enables both server-rendered and static site generation. Remix provides a modern, convention-based approach to building web applications. |
| **Slate** | A popular open-source Markdown documentation toolkit that makes it easy to create and publish beautiful documentation websites. It's commonly used for building developer documentation and API references. |
| **Svelte** | A component framework for building user interfaces. While Svelte is primarily used for building dynamic web applications, it can also be used to create static sites, which Cloudflare Pages supports. |
| **Sveltekit** | A framework for building web applications with Svelte. SvelteKit provides a set of tools and features for building server-rendered and statically-generated Svelte applications. |
| **Umi** | A pluggable enterprise-level React application framework. Umi focuses on providing a seamless development experience and can be used to build static sites as well as dynamic web applications. |
| **Vue.js** | A progressive JavaScript framework for building user interfaces. Vue.js is well-suited for building static sites, and Cloudflare Pages supports popular Vue-based static site generators like Nuxt.js. |
| **VuePress** | A Vue.js-powered static site generator for building documentation websites. It's designed to be developer-friendly and provides a set of plugins and themes to help you create high-quality documentation sites. |
| **Zola** | A fast, secure, and reliable static site generator written in Rust. Zola is known for its performance, ease of use, and extensive features, making it a great choice for building static sites. |

As you can see, Cloudflare Pages supports a wide range of static site frameworks and generators, allowing you to choose the one that best fits your project's needs.

## Other Static Site Hosting Options and How they compare?

Cloudflare Pages is not the only platform available for hosting static sites. There are several other popular options, each with its own set of features and trade-offs. Let's compare Cloudflare Pages to some of the other leading static site hosting services:

### Netlify
Netlify is one of the most well-known and widely-used platforms for hosting static sites. Like Cloudflare Pages, Netlify offers a free plan with the following features:

- **Continuous Deployment**: Netlify automatically deploys your site whenever you push changes to your Git repository.
- **Global CDN**: Your static site is served from Netlify's global content delivery network.
- **SSL/HTTPS**: Netlify provides free SSL/HTTPS support for your site.
- **Custom Domains**: Netlify's free plan allows you to use custom domains.

The key differences between Netlify and Cloudflare Pages are:

- **Bandwidth Limits**: Netlify's free plan has a higher monthly bandwidth limit of 100GB, compared to Cloudflare Pages' 100GB limit.
- **Build Minutes**: Netlify's free plan comes with 300 build minutes per month, whereas Cloudflare Pages' free plan has 500 build minutes.
- **Pricing**: Cloudflare Pages' paid plans are generally more affordable than Netlify's, especially if you need additional bandwidth or build minutes.

### GitHub Pages
GitHub Pages is a free static site hosting service provided by GitHub. It's a popular choice for developers who already use GitHub for their projects. Some of the key features of GitHub Pages include:

- **Automatic Deployment**: GitHub Pages automatically publishes your site whenever you push changes to your GitHub repository.
- **Custom Domains**: GitHub Pages supports custom domains, including SSL/HTTPS.
- **Free Hosting**: GitHub Pages is completely free to use for public repositories.

The main limitations of GitHub Pages are:

- **Limited Frameworks**: GitHub Pages has limited support for static site frameworks, primarily focusing on Jekyll and basic HTML/CSS/JS sites.
- **No Build Process**: GitHub Pages doesn't provide a build process, so your site must be pre-built before pushing to the repository.
- **No Bandwidth Limits**: GitHub Pages doesn't have any explicit bandwidth limits, but your site may be subject to GitHub's usage policies.

### AWS S3 and CloudFront
Amazon Web Services (AWS) offers a combination of S3 (Simple Storage Service) and CloudFront (Content Delivery Network) for hosting static sites. This approach provides high performance and scalability, but it requires more technical expertise to set up and manage compared to platforms like Cloudflare Pages or Netlify.

The key benefits of using AWS S3 and CloudFront for static site hosting include:

- **Scalability**: AWS S3 and CloudFront can handle high traffic and large file sizes with ease.
- **Customization**: You have more control over the infrastructure and configuration, allowing for greater customization.
- **Cost-effective**: AWS S3 and CloudFront can be cost-effective for high-traffic sites, especially if you already use other AWS services.

The drawbacks of this approach are:

- **Complex Setup**: Configuring AWS S3 and CloudFront for static site hosting requires more technical knowledge and effort compared to managed platforms.
- **Pricing**: While cost-effective for high-traffic sites, the pricing can be more complex and harder to predict for smaller sites.
- **No Continuous Deployment**: You'll need to manually upload or sync your files to the S3 bucket, unlike the automatic deployment offered by Cloudflare Pages and Netlify.

In summary, Cloudflare Pages, Netlify, GitHub Pages, and AWS S3 with CloudFront are all viable options for hosting static sites, each with its own strengths and weaknesses. Cloudflare Pages stands out with its generous free plan, easy-to-use interface, and wide range of supported frameworks, making it an excellent choice for many developers and website owners.

## Technical Terms Explained

Here are brief explanations of some technical terms used in this blog post:

1. **Server-side Rendering (SSR)**: A technique where the server generates the HTML pages before sending them to the client's browser, as opposed to the client rendering the pages.

2. **Isomorphic/Universal Applications**: Web applications that can be rendered on both the server and the client, allowing for improved performance and better search engine optimization.

3. **Code Splitting**: A technique used to split the application code into smaller, more manageable chunks, which can be loaded on demand, improving the initial load time of the application.

4. **Dependency Injection**: A software design pattern in which one or more dependencies (or services) are injected, or passed, into a dependent object (or client) instead of being created directly within the dependent object.

5. **Content Delivery Network (CDN)**: A network of servers distributed across multiple locations to deliver content (such as web pages, images, and other assets) to users based on their geographic location, reducing latency and improving performance.

6. **Bandwidth Limit**: The maximum amount of data that can be transferred over an internet connection within a specific time period, typically measured in gigabytes (GB) per month.

7. **Build Minutes**: The amount of time a hosting platform can spend building your site during deployments, typically measured in minutes per month.

These technical terms may be helpful for users who are not familiar with some of the concepts mentioned in the blog post.

## Conclusion

Cloudflare Pages is a powerful and user-friendly platform for hosting static sites. Its generous free plan, global CDN, and support for a wide range of static site frameworks and generators make it an excellent choice for developers and website owners looking to deploy their projects quickly and cost-effectively.

Whether you're building a simple blog with Jekyll, a complex web application with Create React App, or a high-performance static site with Gatsby, Cloudflare Pages can handle it all. And with its easy-to-use deployment process and automatic continuous integration features, you can focus on building great websites without worrying about the underlying infrastructure.

So why not give Cloudflare Pages a try? With its free plan and extensive support for the latest web development tools and technologies, it's a platform that's worth considering for your next static site project.
