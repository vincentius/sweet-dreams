# Deploy to GitHub Pages Instructions

To deploy the Sweet Dreams app to your GitHub Pages (vincentius/sweet-dreams):

## First Time Setup

1. Make sure you have a GitHub repository created at https://github.com/vincentius/sweet-dreams

2. Install the gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Set up your git remote (if not already done):
   ```bash
   git remote add origin https://github.com/vincentius/sweet-dreams.git
   ```

## Deploy Steps

1. Build and deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

   This command will:
   - Build the app using webpack
   - Create a gh-pages branch
   - Push the dist folder contents to that branch

2. Configure GitHub Pages:
   - Go to https://github.com/vincentius/sweet-dreams/settings/pages
   - Under "Source", select "Deploy from a branch"
   - Select "gh-pages" branch and "/ (root)" folder
   - Click Save

3. Your app will be available at: https://vincentius.github.io/sweet-dreams/

## Update Deployment

Whenever you make changes and want to update the live site:

```bash
npm run deploy
```

## Manual Deployment (Alternative)

If the npm script doesn't work, you can use the deploy.sh script:

```bash
./deploy.sh
```

This script manually builds and pushes to the gh-pages branch.