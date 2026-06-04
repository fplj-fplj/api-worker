import type { EndpointType, ProviderType } from "../provider-transform";
import type { RequestEntry, RequestEntryFormat } from "../site-metadata";

function resolveAutomaticRequestEntryFormat(options: {
	downstreamProvider: ProviderType;
	endpointType: EndpointType;
}): RequestEntryFormat | null {
	if (options.downstreamProvider === "openai") {
		if (options.endpointType === "responses") {
			return "openai_responses";
		}
		if (options.endpointType === "chat") {
			return "openai_chat";
		}
	}
	if (
		options.downstreamProvider === "anthropic" &&
		options.endpointType === "chat"
	) {
		return "anthropic_messages";
	}
	if (
		options.downstreamProvider === "gemini" &&
		options.endpointType === "chat"
	) {
		return "gemini_generate_content";
	}
	return null;
}

function resolveDefaultRequestEntryPath(
	format: RequestEntryFormat,
): string | undefined {
	if (format === "openai_chat") {
		return "/v1/chat/completions";
	}
	if (format === "openai_responses") {
		return "/v1/responses";
	}
	if (format === "anthropic_messages") {
		return "/v1/messages";
	}
	return undefined;
}

export function applyCustomRequestEntry(options: {
	entry?: RequestEntry | null;
	downstreamProvider?: ProviderType;
	endpointType: EndpointType;
}):
	| {
			path?: string;
			absoluteUrl?: string;
			upstreamProvider: ProviderType;
			requestEntryFormatToPersist?: RequestEntryFormat;
	  }
	| null
	| undefined {
	const entry = options.entry;
	if (!entry?.path && !entry?.format) {
		return undefined;
	}
	const downstreamProvider = options.downstreamProvider ?? "openai";
	const effectiveFormat =
		entry.format ??
		resolveAutomaticRequestEntryFormat({
			downstreamProvider,
			endpointType: options.endpointType,
		});
	if (!effectiveFormat) {
		return null;
	}
	const acceptsRequest =
		(effectiveFormat === "openai_responses" &&
			downstreamProvider === "openai" &&
			options.endpointType === "responses") ||
		(effectiveFormat === "openai_chat" &&
			downstreamProvider === "openai" &&
			options.endpointType === "chat") ||
		(effectiveFormat === "anthropic_messages" &&
			downstreamProvider === "anthropic" &&
			options.endpointType === "chat") ||
		(effectiveFormat === "gemini_generate_content" &&
			downstreamProvider === "gemini" &&
			options.endpointType === "chat");
	if (!acceptsRequest) {
		return null;
	}
	const upstreamProvider =
		effectiveFormat === "anthropic_messages"
			? "anthropic"
			: effectiveFormat === "gemini_generate_content"
				? "gemini"
				: "openai";
	const requestEntryFormatToPersist = entry.format
		? undefined
		: effectiveFormat;
	const resolvedPath =
		entry.path ?? resolveDefaultRequestEntryPath(effectiveFormat);
	if (
		resolvedPath &&
		(resolvedPath.startsWith("http://") || resolvedPath.startsWith("https://"))
	) {
		return {
			absoluteUrl: resolvedPath,
			upstreamProvider,
			requestEntryFormatToPersist,
		};
	}
	return {
		path: resolvedPath,
		upstreamProvider,
		requestEntryFormatToPersist,
	};
}
