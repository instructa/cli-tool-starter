import { fileURLToPath } from "node:url";
import { runCommand as _runCommand, runMain as _runMain } from "citty";
import { commands } from "./commands";
import main from "./main";

// Declare the global type
declare global {
	// eslint-disable-next-line no-var
	var __cli__: {
		startTime: number;
		entry: string;
	};
}

globalThis.__cli__ = globalThis.__cli__ || {
	// Programmatic usage fallback
	startTime: Date.now(),
	entry: fileURLToPath(
		new URL(
			import.meta.url.endsWith(".ts")
				? "../bin/cli.mjs"
				: "../../bin/cli.mjs",
			import.meta.url,
		),
	),
};

// Export the main runner
export const runMain = () => _runMain(main);

// Subcommands
export async function runCommand(
	name: string,
	argv: string[] = process.argv.slice(2),
	data: { overrides?: Record<string, any> } = {},
) {
	if (!(name in commands)) {
		throw new Error(`Invalid command ${name}`);
	}

	return await _runCommand(await commands[name as keyof typeof commands](), {
		rawArgs: argv,
		data: {
			overrides: data.overrides || {},
		},
	});
}
