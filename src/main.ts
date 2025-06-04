import { defineCommand } from "citty";
import { description, name, version } from "../package.json";
import { commands } from "./commands";
import { cwdArgs } from "./commands/_shared";

export const main = defineCommand({
	meta: {
		name,
		version,
		description,
	},
	args: {
		...cwdArgs,
		config: {
			type: "string",
			alias: "c",
			description: "Path to configuration file",
		},
		preset: {
			type: "string",
			description: "Preset to use",
		},
		command: {
			type: "positional",
			required: false,
		},
	},
	subCommands: commands,

	// Setup hook to process config path if needed
	setup(ctx) {
		// Initialize ctx.data if it doesn't exist
		ctx.data = ctx.data || {};

		// Store config path in ctx.data for backward compatibility
		if (ctx.args.config) {
			const { resolve } = require("pathe");
			ctx.data.configPath = resolve(ctx.args.config.replace(/^['"]|['"]$/g, ""));
		}
		if (ctx.args.preset) {
			ctx.data.presets = [ctx.args.preset];
		}
	},
});

export default main;
