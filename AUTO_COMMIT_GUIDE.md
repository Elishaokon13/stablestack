# Auto-Commit Setup Guide

Automatic git commit system for your codebase. Two modes available: **Watch Mode** and **Interval Mode**.

## 🚀 Quick Start

### Option 1: Watch Mode (Recommended)

Watches for file changes and commits after changes stop for 5 seconds:

```bash
npm run auto-commit
```

### Option 2: Interval Mode

Commits all changes every X minutes (default: 5 minutes):

```bash
npm run auto-commit:interval
```

## ⚙️ Configuration

Edit `.autocommitrc.json` to customize settings:

```json
{
  "enabled": true,
  "mode": "watch",
  "debounceTime": 5000, // Wait 5s after last change (watch mode)
  "intervalMinutes": 5, // Commit every 5 minutes (interval mode)
  "messagePrefix": "🤖 Auto-commit:",
  "autoPush": false, // Set to true to auto-push to remote
  "branch": "main", // Branch to push to
  "exclude": [
    // Files/folders to ignore
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    ".env.local",
    ".env"
  ]
}
```

## 📋 Features

### Watch Mode (`npm run auto-commit`)

✅ Monitors file changes in real-time
✅ Debounces commits (waits for changes to stop)
✅ Shows which files changed
✅ Gracefully handles Ctrl+C (commits pending changes)
✅ Smart exclusion of build folders and dependencies

### Interval Mode (`npm run auto-commit:interval`)

✅ Commits at regular intervals (configurable)
✅ Checks for changes before committing
✅ More predictable commit schedule
✅ Good for long-running dev sessions

## 🎯 Use Cases

### Development

```bash
# Run alongside your dev server
npm run dev          # Terminal 1
npm run auto-commit  # Terminal 2
```

### Auto-save work sessions

```bash
# Commits every 5 minutes
npm run auto-commit:interval
```

### Enable Auto-push

Edit configuration in scripts or `.autocommitrc.json`:

```javascript
autoPush: true,
branch: 'your-branch-name'
```

## 🛠️ Customization

### Change Commit Delay (Watch Mode)

Edit `scripts/auto-commit.js`:

```javascript
debounceTime: 10000, // 10 seconds instead of 5
```

### Change Commit Interval

Edit `scripts/auto-commit-interval.js`:

```javascript
intervalMinutes: 10, // Commit every 10 minutes
```

### Custom Commit Messages

Edit message prefix:

```javascript
messagePrefix: '✨ Auto-save:',
```

### Exclude More Files

Add patterns to the `exclude` array:

```javascript
exclude: ["node_modules", ".next", "temp", "*.tmp"];
```

## 📝 Commit Message Format

### Watch Mode

```
🤖 Auto-commit: Updated 3 files - 10/3/2025, 2:30:45 PM

Files: app/page.tsx, middleware.ts, package.json
```

### Interval Mode

```
🤖 Auto-commit (interval): 10/3/2025, 2:35:00 PM
```

## 🔧 Manual Control

### Stop Auto-commit

Press `Ctrl+C` in the terminal running the script. It will:

1. Stop watching
2. Commit any pending changes
3. Exit gracefully

### Temporary Disable

Just kill the process - no harm done!

### Resume

Run the command again:

```bash
npm run auto-commit
```

## ⚠️ Important Notes

1. **Auto-push disabled by default** - Enable only if you're sure!
2. **Excludes sensitive files** - `.env`, `.env.local` are excluded
3. **Works with existing git workflow** - Doesn't interfere with manual commits
4. **Safe to stop anytime** - Ctrl+C commits pending changes first

## 🐛 Troubleshooting

### "Error checking git status"

Make sure you're in a git repository:

```bash
git status
```

### "Error pushing"

If auto-push is enabled, ensure you have:

- Remote repository configured
- Push access to the repository
- Correct branch name in config

### Not detecting changes

Check if files are in the exclude list. Edit `.autocommitrc.json` to adjust exclusions.

## 💡 Tips

1. **Run in separate terminal** - Keep it running alongside your dev server
2. **Use watch mode for active development** - More responsive
3. **Use interval mode for background work** - Set and forget
4. **Don't enable auto-push unless needed** - Review commits first
5. **Customize commit messages** - Make them meaningful for your workflow

## 🔄 Integration with Dev Workflow

### With VS Code

Add to VS Code tasks (`.vscode/tasks.json`):

```json
{
  "label": "Auto-commit",
  "type": "shell",
  "command": "npm run auto-commit",
  "isBackground": true
}
```

### With tmux/screen

Run in a persistent session:

```bash
tmux new-session -s autocommit 'npm run auto-commit'
```

## 📚 Additional Resources

- Git Documentation: https://git-scm.com/doc
- Node.js File System Watching: https://nodejs.org/api/fs.html#fswatchfilename-options-listener

---

Made with ❤️ for continuous development workflows
