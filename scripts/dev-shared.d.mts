export interface DevHealthTarget {
	name: string;
	commandName: string;
	url: string;
}

export interface DevHealthCheck extends DevHealthTarget {
	ok: boolean;
	status?: number | null;
	error?: string;
}

export function buildDevHealthTargets(input: {
	workerPort: number;
	attemptWorkerPort: number;
	skipAttemptWorker: boolean;
}): DevHealthTarget[];

export function summarizeHealthChecks(checks: DevHealthCheck[]): {
	healthy: boolean;
	level: string;
	message: string;
	failedChecks: DevHealthCheck[];
};

export function shouldRestartUnhealthyService(input: {
	now: number;
	startedAt: number;
	startupGraceMs: number;
	restartThreshold: number;
	restartCooldownMs: number;
	consecutiveFailures: number;
	lastRestartAt?: number | null;
}): boolean;

export function waitForChildExit(
	child:
		| {
				exitCode: number | null;
				off(eventName: "exit", listener: () => void): void;
				once(eventName: "exit", listener: () => void): void;
		  }
		| null
		| undefined,
	timeoutMs: number,
): Promise<void>;

export function classifyBackgroundDevState(input: {
	pidRunning: boolean;
	healthSummary?: {
		healthy: boolean;
	} | null;
}): {
	level: string;
	state: string;
	message: string;
};

export function resolveChildExitSupervisorAction(input: {
	shuttingDown: boolean;
	restarting: boolean;
	isCurrentChild: boolean;
	code: number | null;
	allChildrenExited: boolean;
}):
	| {
			type: "ignore";
	  }
	| {
			type: "shutdown";
			code: number;
	  };
