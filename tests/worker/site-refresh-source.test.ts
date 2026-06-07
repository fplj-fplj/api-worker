import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const siteTaskDispatcherSource = readFileSync(
	"apps/worker/src/services/site-task-dispatcher.ts",
	"utf8",
);

describe("site refresh source contracts", () => {
	it("单站手动拉取模型不会因为站点是 disabled 被直接拒绝", () => {
		expect(siteTaskDispatcherSource).not.toContain(
			'if (channel.status !== "active")',
		);
		expect(siteTaskDispatcherSource).not.toContain("仅启用渠道可更新");
	});
});
