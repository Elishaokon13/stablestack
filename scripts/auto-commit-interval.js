#!/usr/bin/env node

/**
 * Auto-commit on interval script
 * Commits all changes at regular intervals
 * Usage: npm run auto-commit:interval
 */

const { exec } = require("child_process");

// Configuration
const CONFIG = {
  // Interval in minutes
  intervalMinutes: 5,

  // Commit message prefix
  messagePrefix: "🤖 Auto-commit (interval):",

  // Enable/disable auto-push
  autoPush: false,

  // Branch to push to
  branch: "main",
};

console.log("🚀 Interval-based auto-commit started...");
console.log(`⏱️  Commit interval: ${CONFIG.intervalMinutes} minute(s)`);
console.log(`🌳 Working directory: ${process.cwd()}`);
console.log("📝 Auto-committing at regular intervals...\n");

function performCommit() {
  const timestamp = new Date().toLocaleString();
  const commitMessage = `${CONFIG.messagePrefix} ${timestamp}`;

  console.log(`\n💾 [${timestamp}] Checking for changes...`);

  // Check if there are changes
  exec("git status --porcelain", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error checking status:", error.message);
      return;
    }

    if (!stdout.trim()) {
      console.log("ℹ️  No changes to commit\n");
      return;
    }

    // Count changed files
    const fileCount = stdout.trim().split("\n").length;
    console.log(`📝 Found ${fileCount} changed file(s)`);

    // Stage all changes
    exec("git add -A", (error) => {
      if (error) {
        console.error("❌ Error staging files:", error.message);
        return;
      }

      // Commit
      exec(`git commit -m "${commitMessage}"`, (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Error committing:", error.message);
          return;
        }

        console.log("✅ Commit successful!");
        console.log(`   Message: ${commitMessage}`);
        console.log(`   Files: ${fileCount}\n`);

        // Auto-push if enabled
        if (CONFIG.autoPush) {
          console.log("🚀 Pushing to remote...");
          exec(`git push origin ${CONFIG.branch}`, (error) => {
            if (error) {
              console.error("❌ Error pushing:", error.message);
              return;
            }
            console.log("✅ Pushed successfully!\n");
          });
        }
      });
    });
  });
}

// Run immediately
performCommit();

// Set up interval
const intervalMs = CONFIG.intervalMinutes * 60 * 1000;
setInterval(performCommit, intervalMs);

console.log(`⏰ Next commit in ${CONFIG.intervalMinutes} minute(s)...`);
console.log("👀 Press Ctrl+C to stop\n");

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Stopping auto-commit...");
  console.log("💾 Performing final commit before exit...\n");
  performCommit();
  setTimeout(() => process.exit(0), 2000);
});
