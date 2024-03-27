// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function jsonToXml(rawJson: string | Record<string, any>): string {
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let json;

	try {
		json = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
	} catch {
		return typeof rawJson === "string" ? rawJson : "";
	}

	let xml = "";

	for (const key in json) {
		// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
		if (json.hasOwnProperty(key)) {
			const value = json[key];

			if (value === null) {
				// Handle null values
				xml += `<${escapeXmlTag(key)}></${escapeXmlTag(key)}>`;
			} else if (Array.isArray(value)) {
				// Handle arrays
				if (value.length === 0) {
					// Handle empty arrays
					xml += `<${escapeXmlTag(key)}></${escapeXmlTag(key)}>`;
				} else {
					// biome-ignore lint/complexity/noForEach: <explanation>
					value.forEach((element) => {
						if (typeof element === "object") {
							xml += `<${escapeXmlTag(key)}>${jsonToXml(
								element,
							)}</${escapeXmlTag(key)}>`;
						} else {
							xml += `<${escapeXmlTag(key)}>${escapeXmlValue(
								element,
							)}</${escapeXmlTag(key)}>`;
						}
					});
				}
			} else if (typeof value === "object") {
				// Handle objects
				if (Object.keys(value).length === 0) {
					// Handle empty objects
					xml += `<${escapeXmlTag(key)}></${escapeXmlTag(key)}>`;
				} else {
					xml += `<${escapeXmlTag(key)}>${jsonToXml(value)}</${escapeXmlTag(
						key,
					)}>`;
				}
			} else {
				// Handle primitive values
				xml += `<${escapeXmlTag(key)}>${escapeXmlValue(value)}</${escapeXmlTag(
					key,
				)}>`;
			}
		}
	}

	return xml;
}

function escapeXmlTag(tag: string): string {
	// Escape special characters in XML tag names
	return tag.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function escapeXmlValue(value: any): string {
	// Escape special characters in XML values
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
