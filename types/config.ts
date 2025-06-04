export interface Config {
	ide?: string;
	// Add other configuration options here
	[key: string]: unknown; // Allow other keys potentially
}

export interface ResolvedConfig {
	config?: Config | null; // Config object (or null/undefined if not found)
	configFile?: string; // Path to the loaded config file
	layers?: unknown[]; // Layers used by c12 (if any)
	cwd: string; // The resolved working directory
}
