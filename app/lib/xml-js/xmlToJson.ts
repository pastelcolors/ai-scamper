import xmljs from "xml-js";
import { transformJsonFromXmljs } from "./transformJsonFromXmljs.js";

export function xmlToJson<T>(xmlStr: string): T {
	console.log(`Parsing XML: ${xmlStr}`);
	const rootString = `<_root>${xmlStr}</_root>`
		.replace(/&/g, "&amp;")
		.replace(/-/g, "&#45;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

	try {
		const jsonObj = xmljs.xml2js(rootString, {
			compact: true,
		});

		return transformJsonFromXmljs(jsonObj);
	} catch (err) {
		console.error(`Failed to parse XML: ${err}`);
		throw err;
	}
}
