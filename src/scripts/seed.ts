/**
 * Database Seed Script
 *
 * This script seeds the D1 database with phases and problems data.
 * Run with: bun run db:seed (after adding the script to package.json)
 *
 * For remote D1:
 * wrangler d1 execute grand-cp-db --remote --file=./src/scripts/seed.sql
 */

import { phases as phasesData } from "../data/phases";
import { problems as problemsData } from "../data/problems";

function generateSeedSQL(): string {
  const statements: string[] = [];

  // Clear existing data
  statements.push("-- Clear existing data");
  statements.push("DELETE FROM status_history;");
  statements.push("DELETE FROM user_problems;");
  statements.push("DELETE FROM problems;");
  statements.push("DELETE FROM phases;");
  statements.push("");

  // Insert phases
  statements.push("-- Insert phases");
  for (const phase of phasesData) {
    const description = phase.description ? `'${phase.description.replace(/'/g, "''")}'` : "NULL";
    const focus = phase.focus ? `'${phase.focus.replace(/'/g, "''")}'` : "NULL";
    const targetStart = phase.targetRatingStart ?? "NULL";
    const targetEnd = phase.targetRatingEnd ?? "NULL";

    statements.push(
      `INSERT INTO phases (id, name, description, target_rating_start, target_rating_end, focus, problem_start, problem_end) VALUES (${phase.id}, '${phase.name}', ${description}, ${targetStart}, ${targetEnd}, ${focus}, ${phase.problemStart}, ${phase.problemEnd});`,
    );
  }
  statements.push("");

  // Insert problems
  statements.push("-- Insert problems");
  for (const problem of problemsData) {
    const note = problem.note ? `'${problem.note.replace(/'/g, "''")}'` : "NULL";
    const isStarred = problem.isStarred ? 1 : 0;
    const name = problem.name.replace(/'/g, "''");
    const topic = problem.topic.replace(/'/g, "''");

    statements.push(
      `INSERT INTO problems (number, platform, name, url, phase_id, topic, is_starred, note) VALUES (${problem.number}, '${problem.platform}', '${name}', '${problem.url}', ${problem.phaseId}, '${topic}', ${isStarred}, ${note});`,
    );
  }

  return statements.join("\n");
}

// Generate and output the SQL
const sql = generateSeedSQL();

// Write to file
const fs = await import("node:fs");
fs.writeFileSync("src/scripts/seed.sql", sql);
console.log("✓ Generated seed.sql with:");
console.log(`  - ${phasesData.length} phases`);
console.log(`  - ${problemsData.length} problems`);
console.log("");
console.log("To seed remote D1, run:");
console.log("  wrangler d1 execute grand-cp-db --remote --file=./src/scripts/seed.sql");
