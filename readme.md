# SIGMINCETUR Scraper

A robust Node.js tool to scrape and process tourism data from **SIGMINCETUR**. This project has been modernized to support both a command-line interface (CLI) and a web-based dashboard, with optional integration for local app services.

## Features
- **Region Name Resolution**: Automatically resolves names like "Ancash" to their Ubigeo codes.
- **Dual Interface**: Use the terminal or a clean Web Dashboard.
- **Direct API Access**: Bypasses CORS issues by using a server-side Node.js client.
- **Local Integration**: Optional adapter to format and upload data to a local app service.

## Installation

1.  **Prerequisites**: Node.js (v18+ recommended).
2.  Clone the repository:
    ```bash
    git clone https://github.com/MeloDev2111/SIGMINCETUR-Scraper.git
    cd SIGMINCETUR-Scraper
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

### 1. Web Dashboard (Recommended)
Start the local server to use the visual interface.

```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
- Select a Region from the dropdown.
- (Optional) Enter a Province to filter results.
- Click **Start Scraper**.
- Download the JSON or upload it to your local app directly.

### 2. Command Line Interface (CLI)
Run the scraper directly from your terminal.

**Basic Scrape:**
```bash
# By Region Name
npm run scrape Ancash

# By UBIGEO Code
npm run scrape 02
```

**Advanced Options:**
```bash
# Filter by Province and save to specific file
npm run scrape Ancash Santa -- --output data/custom/my_data.json

# Upload to Local TuriApp Service
# Scraped data -> data/raw/data.json
# Sent data -> data/sent/data.json
npm run scrape Ancash upload
```

## Project Structure
The project is organized into modular components:

- **`src/core/`**: Reusable logic.
    - `client.js`: HTTP client for SIGMINCETUR API.
    - `scraper.js`: Main scraping and filtering logic.
    - `turi_adapter.js`: Data transformation for TuriApp.
    - `uploader.js`: File upload handler.
- **`src/cli/`**: CLI entry point (`yargs`).
- **`src/web/`**: API Server (`express`) and Frontend assets.

## Development & Release

This project uses **Conventional Commits** to automate versioning and changelogs.

### 1. Contributing
When committing changes, use the standard format:
- `feat: ...` for new features (triggers MINOR version bump).
- `fix: ...` for bug fixes (triggers PATCH version bump).
- `chore: ...` for maintenance (no version bump).

We recommend using **Conventional Commits** to keep the history clean, enabling `auto-changelog` to generate readable summaries.

- `feat: ...` for new features.
- `fix: ...` for bug fixes.
- `docs: ...` for documentation changes.

### 2. Creating a Release
To create a new version:

```bash
npm run release
```

**What happens?**
1.  **release-it** analyzes your commits (Conventional Commits) to calculate the next version (Major, Minor, or Patch).
2.  It bumps the version in `package.json`.
3.  It triggers **auto-changelog** to regenerate `CHANGELOG.md`.
4.  It commits changes, tags the release (e.g., `v1.0.1`), and (optionally) pushes to GitHub.