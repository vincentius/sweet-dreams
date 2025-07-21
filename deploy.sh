#!/bin/bash

# Build the project
npm run build

# Navigate into the build output directory
cd dist

# Initialize a new git repository in dist folder
git init
git add -A
git commit -m 'Deploy to GitHub Pages'

# Force push to the gh-pages branch
git push -f https://github.com/vincentius/sweet-dreams.git main:gh-pages

cd ..

echo "Deployment complete!"
echo "Visit https://vincentius.github.io/sweet-dreams/ to see your app"