import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const targetPath = path.join(
	process.cwd(),
	"node_modules",
	"next",
	"dist",
	"compiled",
	"@vercel",
	"og",
	"index.edge.js",
);

const replacements: Array<[string, string]> = [
	["resvg.wasm?module", "resvg.wasm"],
	["yoga.wasm?module", "yoga.wasm"],
];

const patchFile = async () => {
	let contents: string;
	try {
		contents = await readFile(targetPath, "utf8");
	} catch (error) {
		console.warn("patch-next-og: target not found", { targetPath, error });
		return;
	}

	let updated = contents;
	for (const [from, to] of replacements) {
		updated = updated.replaceAll(from, to);
	}

	if (updated === contents) {
		console.info("patch-next-og: no changes needed");
		return;
	}

	await writeFile(targetPath, updated, "utf8");
	console.info("patch-next-og: patched", targetPath);
};

await patchFile();
