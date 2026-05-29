export const buildDevHealthTargets = ({
	workerPort,
	attemptWorkerPort,
	skipAttemptWorker,
}) => {
	const targets = [];
	if (!skipAttemptWorker) {
		targets.push({
			name: "attempt-worker",
			commandName: "attempt-worker",
			url: `http://127.0.0.1:${attemptWorkerPort}/health`,
		});
	}
	targets.push({
		name: "worker",
		commandName: "worker",
		url: `http://127.0.0.1:${workerPort}/health`,
	});
	return targets;
};

export const summarizeHealthChecks = (checks) => {
	const failedChecks = checks.filter((item) => !item.ok);
	if (failedChecks.length === 0) {
		return {
			healthy: true,
			level: "success",
			message: "服务健康检查正常",
			failedChecks,
		};
	}
	return {
		healthy: false,
		level: "warn",
		message: `服务健康检查异常：${failedChecks
			.map((item) => item.name)
			.join(", ")}`,
		failedChecks,
	};
};

export const shouldRestartUnhealthyService = ({
	now,
	startedAt,
	startupGraceMs,
	restartThreshold,
	restartCooldownMs,
	consecutiveFailures,
	lastRestartAt,
}) => {
	if (now - startedAt < startupGraceMs) {
		return false;
	}
	if (consecutiveFailures < restartThreshold) {
		return false;
	}
	if (
		typeof lastRestartAt === "number" &&
		now - lastRestartAt < restartCooldownMs
	) {
		return false;
	}
	return true;
};

export const waitForChildExit = (child, timeoutMs) =>
	new Promise((resolve) => {
		if (!child || child.exitCode !== null) {
			resolve();
			return;
		}
		const timeout = setTimeout(() => {
			child.off("exit", onExit);
			resolve();
		}, timeoutMs);
		const onExit = () => {
			clearTimeout(timeout);
			resolve();
		};
		child.once("exit", onExit);
	});

export const classifyBackgroundDevState = ({ pidRunning, healthSummary }) => {
	if (!pidRunning) {
		return {
			level: "info",
			state: "stopped",
			message: "后台 dev 未运行",
		};
	}
	if (!healthSummary?.healthy) {
		return {
			level: "warn",
			state: "degraded",
			message: "后台 dev 父进程运行中，但服务健康检查异常",
		};
	}
	return {
		level: "success",
		state: "healthy",
		message: "后台 dev 正在运行",
	};
};

export const resolveChildExitSupervisorAction = ({
	shuttingDown,
	restarting,
	isCurrentChild,
	code,
	allChildrenExited,
}) => {
	if (shuttingDown || restarting || !isCurrentChild) {
		return { type: "ignore" };
	}
	if (code && code !== 0) {
		return { type: "shutdown", code };
	}
	if (allChildrenExited) {
		return { type: "shutdown", code: 0 };
	}
	return { type: "ignore" };
};
