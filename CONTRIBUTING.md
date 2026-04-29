# Contributing to HealthMate 🩺

First off, thank you for considering contributing to HealthMate. It's people like you that make HealthMate such a great tool for personal and family health management.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check issues first to see if someone else has already created it. If not, feel free to open a new issue.

## 2. Fork & create a branch

If this is something you think you can fix, then fork HealthMate and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-dark-mode
```

## 3. Local Development

1.  **Install Dependencies:** Run `npm install`
2.  **Environment Variables:** Copy `.env.example` to `.env` and fill in necessary keys.
3.  **Start Development Server:** Run `npm run dev`

We use `vite` for the frontend and `express` for the backend, bundled with `esbuild`. The main entry point for the backend logic is `server.ts`.

## 4. Submitting a Pull Request

Please ensure your pull request adheres to the following guidelines:

-   Search previous suggestions before making a new one, as yours may be a duplicate.
-   Make an individual pull request for each suggestion.
-   Use clear and descriptive commit messages.
-   If your PR fixes an issue, include "Fixes #issue_number" in the description.

## 5. Code Style

-   Use **TypeScript** strictly.
-   Use **Tailwind CSS** for component styling.
-   Ensure all tests (if any) pass before committing.

Thank you!
