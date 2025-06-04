import { existsSync, mkdirSync } from "node:fs";
import { promises as fsp } from "node:fs";
import process from "node:process";

import { defineCommand } from "citty";
import { colors } from "consola/utils";
import { relative, resolve } from "pathe";

import { logger } from "../utils/logger";
import { cwdArgs } from "./_shared";

// Generic config structure
interface ProjectConfig {
	[key: string]: any;
}

// Function to create the config file
async function createConfigFile(
	projectPath: string,
	config: Partial<ProjectConfig>,
	configFileName: string = "config.js",
) {
	const configFilePath = resolve(projectPath, configFileName);

	// Check if config file already exists
	if (existsSync(configFilePath)) {
		const overwrite = await logger
			.prompt(
				`Configuration file ${colors.cyan(relative(process.cwd(), configFilePath))} already exists. Overwrite?`,
				{
					type: "confirm",
					initial: false,
					cancel: "reject",
				},
			)
			.catch(() => process.exit(1));

		if (!overwrite) {
			logger.info("Skipped configuration file creation.");
			return; // Exit the function without writing the file
		}
		logger.info("Overwriting existing configuration file.");
	}

	// Generate ES Module content
	const configContent = `// Project Configuration File
// Add your configuration options here

export default ${JSON.stringify(config, null, 2)};
`;

	await fsp.writeFile(configFilePath, configContent);
	logger.success(
		`Created configuration file: ${colors.cyan(relative(process.cwd(), configFilePath))}`,
	);
}

export default defineCommand({
	meta: {
		name: "init",
		description: "Initialize project in the current directory",
	},
	args: {
		...cwdArgs,
		dir: {
			type: "positional",
			description: "Directory to initialize in (defaults to current directory)",
			default: ".",
		},
	},
	async run(ctx) {
		const cwd = resolve(ctx.args.cwd || ".");
		const projectPath = resolve(cwd, ctx.args.dir || ".");
		const relativeProjectPath = relative(process.cwd(), projectPath) || ".";

		logger.info(`Initializing project in ${colors.cyan(relativeProjectPath)}...`);

		try {
			if (!existsSync(projectPath)) {
				mkdirSync(projectPath, { recursive: true });
				logger.success(
					`Created directory: ${colors.cyan(relativeProjectPath)}`,
				);
			}

			// Create a basic config object
			const config: Partial<ProjectConfig> = {
				name: "my-project",
				version: "1.0.0",
			};

			// Create the config file
			await createConfigFile(projectPath, config, "project.config.js");
		} catch (error_) {
			logger.error(`Failed to initialize project: ${(error_ as Error).message}`);
			process.exit(1);
		}

		logger.log(
			`\n✨ Project initialized successfully in ${colors.cyan(relativeProjectPath)}`,
		);
		logger.log(
			`  Created ${colors.cyan("project.config.js")} configuration file.`,
		);
		logger.log("\nNext steps:");
		const steps = [
			relativeProjectPath !== "." &&
				`Navigate to the '${relativeProjectPath}' directory.`,
			"Edit the configuration file to customize your project settings.",
			"Start building your project!",
		].filter(Boolean);

		for (const step of steps) {
			logger.log(` › ${step}`);
		}
	},
});
