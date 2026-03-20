import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ogDirPath = path.join(
	process.cwd(),
	"node_modules",
	"next",
	"dist",
	"compiled",
	"@vercel",
	"og",
);

const targetPath = path.join(ogDirPath, "index.edge.js");
const nextServerPath = path.join(
	process.cwd(),
	"node_modules",
	"next",
	"dist",
	"server",
	"next-server.js",
);
const bundledFontPath = path.join(ogDirPath, "noto-sans-v27-latin-regular.ttf.bin");
const expectedFontPath = path.join(ogDirPath, "noto-sans-v27-latin-regular.ttf");

const replacements: Array<[string, string]> = [
	["resvg.wasm?module", "resvg.wasm"],
	["yoga.wasm?module", "yoga.wasm"],
];

const nextServerReplacements: Array<[string, string]> = [
	[
		"const manifest = require(this.middlewareManifestPath);",
		"const manifest = (0, _loadmanifestexternal.loadManifest)(this.middlewareManifestPath, false);",
	],
];

const patchIndexEdge = async () => {
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

	if (updated !== contents) {
		await writeFile(targetPath, updated, "utf8");
		console.info("patch-next-og: patched", targetPath);
	} else {
		console.info("patch-next-og: no changes needed", targetPath);
	}
};

const patchNextServer = async () => {
	let contents: string;
	try {
		contents = await readFile(nextServerPath, "utf8");
	} catch (error) {
		console.warn("patch-next-og: next-server target not found", { nextServerPath, error });
		return;
	}

	let updated = contents;
	for (const [from, to] of nextServerReplacements) {
		updated = updated.replaceAll(from, to);
	}

	if (updated !== contents) {
		await writeFile(nextServerPath, updated, "utf8");
		console.info("patch-next-og: patched", nextServerPath);
	} else {
		console.info("patch-next-og: no changes needed", nextServerPath);
	}
};

const ensureFontFile = async () => {
	try {
		await copyFile(bundledFontPath, expectedFontPath);
		console.info("patch-next-og: ensured font", expectedFontPath);
	} catch (error) {
		console.warn("patch-next-og: failed to ensure font", {
			bundledFontPath,
			expectedFontPath,
			error,
		});
	}
};

const main = async () => {
	await patchIndexEdge();
	await patchNextServer();
	await ensureFontFile();
};

main().catch((error) => {
	console.error("patch-next-og: failed", error);
	process.exitCode = 1;
});
