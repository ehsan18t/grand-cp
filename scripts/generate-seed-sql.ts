/**
 * Generate Seed SQL (no DB access)
 *
 * This script ONLY generates a SQL file that can be applied to Cloudflare D1.
 * It does not connect to D1 and it does not run migrations.
 *
 * Output: scripts/seed.sql
 */

import { writeFileSync } from "node:fs";

import { phases as phasesData } from "../src/data/phases";
import { problems as problemsData } from "../src/data/problems";

const escapeSqlString = (value: string) => value.replace(/'/g, "''");

const generateSeedSQL = (): string => {
	const statements: string[] = [];

	statements.push("-- Clear existing data");
	statements.push("DELETE FROM status_history;");
	statements.push("DELETE FROM user_problems;");
	statements.push("DELETE FROM user_favorites;");
	statements.push("DELETE FROM problems;");
	statements.push("DELETE FROM phases;");
	statements.push("");

	statements.push("-- Insert phases");
	for (const phase of phasesData) {
		const description = phase.description
			? `'${escapeSqlString(phase.description)}'`
			: "NULL";
		const focus = phase.focus ? `'${escapeSqlString(phase.focus)}'` : "NULL";
		const targetStart = phase.targetRatingStart ?? "NULL";
		const targetEnd = phase.targetRatingEnd ?? "NULL";

		statements.push(
			`INSERT INTO phases (id, name, description, target_rating_start, target_rating_end, focus, problem_start, problem_end) VALUES (${phase.id}, '${escapeSqlString(phase.name)}', ${description}, ${targetStart}, ${targetEnd}, ${focus}, ${phase.problemStart}, ${phase.problemEnd});`,
		);
	}
	statements.push("");

	statements.push("-- Insert problems");
	for (const problem of problemsData) {
		const note = problem.note ? `'${escapeSqlString(problem.note)}'` : "NULL";
		const isStarred = problem.isStarred ? 1 : 0;
		const name = escapeSqlString(problem.name);
		const topic = escapeSqlString(problem.topic);

		statements.push(
			`INSERT INTO problems (number, platform, name, url, phase_id, topic, is_starred, note) VALUES (${problem.number}, '${escapeSqlString(problem.platform)}', '${name}', '${escapeSqlString(problem.url)}', ${problem.phaseId}, '${topic}', ${isStarred}, ${note});`,
		);
	}

	return statements.join("\n");
};

const sql = generateSeedSQL();
writeFileSync("scripts/seed.sql", sql);

console.log("✓ Generated scripts/seed.sql with:");
console.log(`  - ${phasesData.length} phases`);
console.log(`  - ${problemsData.length} problems`);
