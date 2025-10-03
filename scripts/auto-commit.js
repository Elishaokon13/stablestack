#!/usr/bin/env node

/**
 * Auto-commit script
 * Watches for file changes and automatically commits them
 * Usage: npm run auto-commit
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  // Time to wait after last change before committing (in milliseconds)
  debounceTime: 5000, // 5 seconds

  // Commit message prefix
  messagePrefix: "🤖 Auto-commit:",

  // Files/folders to exclude from watching
  exclude: [
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    ".env.local",
    ".env",
  ],

  // Enable/disable auto-push (set to true if you want to auto-push)
  autoPush: false,

  // Branch to push to
  branch: "main",
};

let commitTimer = null;
let changedFiles = new Set();

console.log("🚀 Auto-commit watcher started...");
console.log(
  `⏱️  Commit delay: ${CONFIG.debounceTime / 1000}s after last change`
);
console.log(`🌳 Working directory: ${process.cwd()}`);
console.log("📝 Watching for changes...\n");

// Check if there are unstaged changes
function checkGitStatus() {
  exec("git status --porcelain", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error checking git status:", error);
      return;
    }

    if (stdout.trim()) {
      console.log("📋 Detected existing changes. Committing...\n");
      scheduleCommit();
    }
  });
}

// Watch for file changes
function watchFiles() {
  const watcher = fs.watch(
    process.cwd(),
    { recursive: true },
    (eventType, filename) => {
      if (!filename) return;

      // Skip excluded files/folders
      const shouldExclude = CONFIG.exclude.some((excluded) =>
        filename.includes(excluded)
      );

      if (shouldExclude) return;

      changedFiles.add(filename);
      console.log(`📝 Changed: ${filename}`);

      // Reset the timer
      scheduleCommit();
    }
  );

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Stopping auto-commit watcher...");
    watcher.close();

    // Commit any pending changes
    if (changedFiles.size > 0) {
      console.log("💾 Committing pending changes before exit...");
      performCommit();
    }

    process.exit(0);
  });
}

// Schedule a commit after debounce time
function scheduleCommit() {
  // Clear existing timer
  if (commitTimer) {
    clearTimeout(commitTimer);
  }

  // Set new timer
  commitTimer = setTimeout(() => {
    performCommit();
  }, CONFIG.debounceTime);
}

// Perform the actual commit
function performCommit() {
  if (changedFiles.size === 0) return;

  const timestamp = new Date().toLocaleString();
  const fileCount = changedFiles.size;
  const fileList = Array.from(changedFiles).slice(0, 5).join(", ");
  const moreFiles = fileCount > 5 ? ` and ${fileCount - 5} more` : "";

  const commitMessage = `${CONFIG.messagePrefix} Updated ${fileCount} file${
    fileCount > 1 ? "s" : ""
  } - ${timestamp}\n\nFiles: ${fileList}${moreFiles}`;

  console.log("\n💾 Starting auto-commit...");

  // Stage all changes
  exec("git add -A", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error staging files:", error.message);
      changedFiles.clear();
      return;
    }

    // Commit changes
    exec(`git commit -m "${commitMessage}"`, (error, stdout, stderr) => {
      if (error) {
        if (error.message.includes("nothing to commit")) {
          console.log("ℹ️  No changes to commit");
        } else {
          console.error("❌ Error committing:", error.message);
        }
        changedFiles.clear();
        return;
      }

      console.log("✅ Commit successful!");
      console.log(`   Message: ${commitMessage.split("\n")[0]}`);
      console.log(`   Files: ${fileCount}\n`);

      // Auto-push if enabled
      if (CONFIG.autoPush) {
        autoPush();
      }

      changedFiles.clear();
    });
  });
}

// Auto-push to remote
function autoPush() {
  console.log("🚀 Pushing to remote...");

  exec(`git push origin ${CONFIG.branch}`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error pushing:", error.message);
      console.log("💡 Tip: Make sure you have push access to the repository\n");
      return;
    }

    console.log("✅ Pushed successfully!\n");
  });
}

// Start watching
checkGitStatus();
watchFiles();

console.log("👀 Watching for changes... (Press Ctrl+C to stop)\n");
