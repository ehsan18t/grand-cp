import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface ProblemData {
  number: number;
  platform: "leetcode" | "codeforces" | "cses" | "atcoder" | "other";
  name: string;
  url: string;
  phaseId: number;
  topic: string;
  isStarred: boolean;
  note: string | null;
}

function getPhaseId(num: number): number {
  if (num <= 65) return 0;
  if (num <= 145) return 1;
  if (num <= 215) return 2;
  if (num <= 295) return 3;
  if (num <= 395) return 4;
  if (num <= 445) return 5;
  if (num <= 575) return 6;
  return 7;
}

function getPlatform(line: string): ProblemData["platform"] {
  if (line.includes("🟢") || line.includes("LC -") || line.includes("leetcode.com")) return "leetcode";
  if (line.includes("🔵") || line.includes("CF -") || line.includes("codeforces.com")) return "codeforces";
  if (line.includes("🟡") || line.includes("CSES -") || line.includes("cses.fi")) return "cses";
  if (line.includes("🟠") || line.includes("AC ") || line.includes("atcoder.jp")) return "atcoder";
  return "other";
}

function parseProblemLine(line: string, currentTopic: string): ProblemData | null {
  // Match pattern: number. emoji [platform - name](url) optional_star optional_note
  // Using a more flexible pattern for emojis
  const match = line.match(/^(\d+)\.\s*.+\s*\[([^\]]+)\]\(([^)]+)\)(.*)$/);
  if (!match) return null;

  const [, numStr, titlePart, url, rest] = match;
  const number = Number.parseInt(numStr, 10);
  
  // Extract name from "LC - Name" or "CF - Name" etc.
  const nameParts = titlePart.split(" - ");
  const name = nameParts.length > 1 ? nameParts.slice(1).join(" - ").trim() : titlePart.trim();
  
  const platform = getPlatform(line);
  const phaseId = getPhaseId(number);
  const isStarred = line.includes("⭐");
  
  // Extract note after ⭐ *note text*
  let note: string | null = null;
  const starNoteMatch = rest.match(/\*([^*]+)\*/);
  if (starNoteMatch) {
    note = starNoteMatch[1].trim();
  } else {
    // Check for note in parentheses at end like (Collatz)
    const parenMatch = rest.match(/\(([^)]+)\)\s*$/);
    if (parenMatch) {
      note = parenMatch[1].trim();
    }
  }

  return {
    number,
    platform,
    name,
    url,
    phaseId,
    topic: currentTopic,
    isStarred,
    note,
  };
}

function validateProblems(allProblems: ProblemData[]) {
  const byNumber = new Map<number, ProblemData[]>();
  for (const p of allProblems) {
    const existing = byNumber.get(p.number) ?? [];
    existing.push(p);
    byNumber.set(p.number, existing);
  }

  const duplicates = [...byNumber.entries()].filter(([, list]) => list.length > 1);
  if (duplicates.length > 0) {
    const sample = duplicates
      .slice(0, 10)
      .map(([num, list]) => `${num} (${list.length}x)`)
      .join(", ");
    throw new Error(`Duplicate problem numbers found: ${sample}`);
  }

  const maxNumber = Math.max(...allProblems.map((p) => p.number));
  if (maxNumber < 1) {
    throw new Error("No problems parsed");
  }

  // Best-effort sanity check: roadmap is intended to be serial.
  // We don't hard fail on gaps >655+, but we do warn on missing early numbers.
  const missing: number[] = [];
  for (let i = 1; i <= Math.min(maxNumber, 655); i++) {
    if (!byNumber.has(i)) missing.push(i);
  }
  if (missing.length > 0) {
    console.warn(
      `Warning: missing problem numbers in 1..${Math.min(maxNumber, 655)}: ${missing
        .slice(0, 25)
        .join(", ")}${missing.length > 25 ? "…" : ""}`,
    );
  }
}

function main() {
  const mdPath = join(__dirname, "..", "public", "grand-cp-list.md");
  const content = readFileSync(mdPath, "utf-8");
  const lines = content.split("\n");

  const problems: ProblemData[] = [];
  let currentTopic = "Unknown";

  for (const line of lines) {
    // Check for topic header (### Topic Name)
    if (line.startsWith("### ")) {
      currentTopic = line.replace("###", "").trim();
      // Remove ⭐ and *text* from topic names
      currentTopic = currentTopic.replace(/⭐.*$/, "").trim();
      continue;
    }

    // Check for problem line (starts with number followed by period)
    if (/^\d+\.\s/.test(line) && line.includes("[") && line.includes("](")) {
      const problem = parseProblemLine(line.trim(), currentTopic);
      if (problem) {
        problems.push(problem);
      }
    }
  }

  problems.sort((a, b) => a.number - b.number);
  validateProblems(problems);

  const outPath = join(__dirname, "..", "src", "data", "generated-problems.ts");

  // Generate TypeScript output
  let output = "// Auto-generated from public/grand-cp-list.md\n";
  output += "// DO NOT EDIT MANUALLY — run `bun run generate:problems`\n\n";
  output += "import type { ProblemData } from \"./problem-types\";\n\n";
  output += "export const problems: ProblemData[] = [\n";

  for (const p of problems) {
    output += "  {\n";
    output += `    number: ${p.number},\n`;
    output += `    platform: \"${p.platform}\",\n`;
    output += `    name: ${JSON.stringify(p.name)},\n`;
    output += `    url: ${JSON.stringify(p.url)},\n`;
    output += `    phaseId: ${p.phaseId},\n`;
    output += `    topic: ${JSON.stringify(p.topic)},\n`;
    output += `    isStarred: ${p.isStarred},\n`;
    output += `    note: ${p.note ? JSON.stringify(p.note) : "null"},\n`;
    output += "  },\n";
  }

  output += "];\n";

  writeFileSync(outPath, output);

  console.log(`Generated ${problems.length} problems across phases 0-7`);
  console.log(`Output written to: ${outPath}`);
}

main();
