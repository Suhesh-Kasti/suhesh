#!/bin/bash

# Build the Hugo site
echo "Building Hugo site..."
hugo --gc --minify

# Replace the generated 404.html with our custom one
echo "Replacing 404.html with custom version..."
cp custom-404.html public/404.html

echo "Build complete with custom 404 page!"
