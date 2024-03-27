import type xmljs from "xml-js";

export function processXmljsNode<T>(node: xmljs.ElementCompact): T | undefined {
	if (!node || typeof node !== "object") {
		return node;
	}

	if (Object.keys(node).length === 0) {
		return undefined;
	}

	if (Array.isArray(node)) {
		try {
			return node.map(processXmljsNode) as T;
		} catch (err) {
			console.error(`Failed to process array XML: ${err}`);
			throw err;
		}
	}

	const result: { [key: string]: T } = {};

	const entries = Object.entries(node);

	if (entries.length === 0) {
		return result as T;
	}

	if ("_text" in node && entries.length === 1) {
		return node._text as T;
	}

	for (const [key, value] of Object.entries(node)) {
		if (key !== "_text") {
			try {
				result[key] = processXmljsNode(value);
			} catch (err) {
				console.error(`Failed to process nested object XML: ${err}`);
				throw err;
			}
		}
	}
	return result as T;
}
