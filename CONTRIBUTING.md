# 🤝 Contributing to CinderX

First off, thank you for considering contributing to **CinderX**! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## 🚀 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cinderx.git
   cd cinderx
   ```
3. **Set up the environments**:
   - For Frontend (Next.js):
     ```bash
     cd Frontend
     npm install
     npm run dev
     ```
   - For Backend (Node.js/Express):
     ```bash
     cd Backend
     npm install
     npm run dev
     ```

## 🌿 Branching Strategy

Please create a new branch for every feature or bugfix. Name it descriptively:
- `feat/add-new-wallet`
- `fix/leaderboard-crash`
- `docs/update-readme`

```bash
git checkout -b feat/your-feature-name
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/). This means your commit messages should be structured like this:
- `feat: added user profile pictures`
- `fix: resolved API rate limit error on dashboard`
- `chore: updated dependencies`
- `docs: added deployment guide`

## 🔄 Pull Request Process

1. **Keep it focused**: Ensure your PR addresses a single issue or adds a specific feature.
2. **Test your code**: Make sure the app builds successfully (`npm run build`).
3. **Update Documentation**: If you've changed APIs or features, update the relevant `README.md`.
4. **Submit**: Open a Pull Request against the `main` branch of the `Kernols/cinderx` repository.

## 🐛 Found a Bug?
If you find a bug, please use the Bug Report issue template to report it. Provide as much context, screenshots, and system info as possible.

## 💡 Have a Feature Request?
We'd love to hear it! Use the Feature Request issue template and explain the motivation and proposed implementation.

Happy coding! 🎉
