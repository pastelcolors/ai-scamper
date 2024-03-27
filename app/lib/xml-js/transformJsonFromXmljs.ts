import type xmljs from "xml-js";
import { processXmljsNode } from "./processXmljsNode.js";

export function transformJsonFromXmljs<T>(json: xmljs.ElementCompact): T {
	if (typeof json !== "object" || json === null) {
		return json;
	}

	if ("_root" in json) {
		try {
			return processXmljsNode(json._root as xmljs.Element);
		} catch (err) {
			console.error(`Failed to process root XML: ${err}`);
			throw err;
		}
	}

	try {
		return processXmljsNode(json);
	} catch (err) {
		console.error(`Failed to process XML: ${err}`);
		throw err;
	}
}
