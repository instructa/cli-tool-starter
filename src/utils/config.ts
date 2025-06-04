import process from "node:process";
import { type LoadConfigOptions, loadConfig as loadC12Config } from "c12";
import { resolve } from "pathe";
import type { Config, ResolvedConfig } from "@types/config";
import { logger } from "./logger";

const defaults: LoadConfigOptions<Config> = {
	name: "scaff", // Name of the config file (scaff.config.ts, scaff.config.js, etc.)
	configFile: "scaff.config", // Base name without extension
	dotenv: true, // Load .env files
};

export async function loadConfig(
	cwd: string = process.cwd(),
): Promise<ResolvedConfig> {
	const resolvedCwd = resolve(cwd);
	logger.debug(`Loading config from: ${resolvedCwd}`);

	const loadedC12Result = await loadC12Config<Config>({
		...defaults,
		cwd: resolvedCwd,
	});

	// Construct the ResolvedConfig object from c12's result
	const resolvedConfig: ResolvedConfig = {
		config: loadedC12Result.config,
		configFile: loadedC12Result.configFile,
		layers: loadedC12Result.layers,
		cwd: resolvedCwd,
	};

	if (!resolvedConfig.config && !resolvedConfig.configFile) {
		logger.debug("No config file found during load attempt.");
		// Return the structure indicating no file was found
		return resolvedConfig; // Already contains cwd and undefined config/configFile
	}

	logger.debug(
		`Loaded config from: ${resolvedConfig.configFile || "unknown source"}`,
	);
	logger.debug("Config content:", resolvedConfig.config);

	return resolvedConfig;
}

// Helper to check if a config file was actually loaded
export function configFileExists(config: ResolvedConfig): boolean {
	return !!config.configFile;
}

// Gets config or throws if not found
export async function loadConfigOrFail(
	cwd?: string,
): Promise<ResolvedConfig> {
	const config = await loadConfig(cwd);
	if (!configFileExists(config)) {
		// Provide a helpful error message
		throw new Error(
			`Configuration file (e.g., ${defaults.name}.config.ts) not found in ${config.cwd}. Please create one manually or check the documentation.`,
		);
	}
	return config;
}
