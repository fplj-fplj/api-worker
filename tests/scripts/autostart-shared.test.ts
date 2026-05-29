import { describe, expect, it } from "vitest";
import { classifyLinuxAutostartStatus } from "../../scripts/autostart-shared.mjs";

describe("classifyLinuxAutostartStatus", () => {
	it("warns when systemd is inactive but a manual daemon instance is running", () => {
		const status = classifyLinuxAutostartStatus({
			installed: true,
			enabled: true,
			activeState: "inactive",
			subState: "dead",
			launchMode: "direct-daemon",
			backgroundRunning: true,
		});

		expect(status.level).toBe("warn");
		expect(status.summary).toContain("systemd 未运行");
		expect(status.running).toBe(true);
		expect(status.needsMigration).toBe(false);
	});
});
