import type { ActionFunctionArgs } from "@remix-run/node";
import { Anthropic, serviceContextFromDefaults } from "llamaindex";
import { jsonToXml } from "~/lib/xml-js/jsonToXml";
import { xmlToJson } from "~/lib/xml-js/xmlToJson";
import {
	DomainExpertResponseSchema,
	StimulatingQuestionResponseSchema,
	aiAgentRequestsPayloadSchema,
	llmResponseSchema,
} from "~/schemas/schemas";

const anthropicClient = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
	model: "claude-3-haiku",
	temperature: 0,
	maxTokens: 2048,
});

const serviceContext = serviceContextFromDefaults({ llm: anthropicClient });

function systemPromptBuilder() {
	return `<instruction>
	Your task is to generate thought-provoking questions that encourage the user to further explore and develop their ideas, based on the context provided in the <input> section. The questions should be inspired by the SCAMPER (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse) technique, but without explicitly mentioning or directly asking a SCAMPER question.
	
	First, carefully review the <input> data, which includes:
	- <roles>: A list of roles, each with a <name> and <description>
	- <graph>: A graph in Mermaid format representing the relationships between ideas or concepts
	- <user_answer>: The user's previous SCAMPER answer
	- <user_answer_node_id>: The node ID corresponding to the user's answer in the graph
	
	For each <role> provided, generate two stimulating questions that manifest the role's perspective and encourage the user to think more deeply about their idea and the topic it covers. The questions should be concise and easy to understand while still being thought-provoking.
	
	When crafting the questions, consider the following:
	- How can the user's idea be viewed from the perspective of each role?
	- What aspects of the idea or topic might each role find interesting, challenging, or worth exploring further?
	- How can the questions guide the user to consider new angles or possibilities related to their idea?
	
	Ensure that the questions are relevant to the user's answer and the node it corresponds to in the graph. Use the graph to understand the context and relationships between the user's answer and other ideas or concepts.
	
	Present the output in the following XML format:
	<output>
	  <questions>
		<question>
		  <name>{roleName1}</name>
		  <thoughts>{STIMULATING_QUESTION_1_FOR_ROLE_1}</thoughts>
		</question>
		<question>
		  <name>{roleName1}</name>
		  <thoughts>{STIMULATING_QUESTION_2_FOR_ROLE_1}</thoughts>
		</question>
		<question>
		  <name>{roleName2}</name>
		  <thoughts>{STIMULATING_QUESTION_1_FOR_ROLE_2}</thoughts>
		</question>
		<question>
		  <name>{roleName2}</name>
		  <thoughts>{STIMULATING_QUESTION_2_FOR_ROLE_2}</thoughts>
		</question>
		...
	  </questions>
	</output>
	
	<guidelines>
	- Generate questions that encourage the user to think more deeply about their idea and the topic it covers
	- Ensure the questions manifest the perspective of each given role
	- Keep the questions concise and easy to understand while still being thought-provoking
	- Use the graph to understand the context and relationships between the user's answer and other ideas or concepts
	- Generate two questions per role
	- Avoid explicitly mentioning or directly asking SCAMPER questions
	- Focus on guiding the user to consider new angles or possibilities related to their idea
	- Ensure the questions are relevant to the user's answer and the corresponding node in the graph
	- Each question should be a maximum of one sentence long
	</guidelines>
	
	Remember, your goal is to help the user expand their thinking and explore their ideas from different perspectives. The questions you generate should serve as catalysts for further reflection and development of the user's concept.
	</instruction>`;
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		const body = await request.json();
		const { projectId, graph, answer, answerNodeId, roles } =
			aiAgentRequestsPayloadSchema.parse(body);

		const prompt = {
			messages: [
				{
					role: "system",
					content: systemPromptBuilder(),
				},
				{
					role: "user",
					content: jsonToXml({
						roles,
						graph,
						user_answer: answer,
						user_answer_node_id: answerNodeId,
					}),
				},
			],
		}
		const msg = await anthropicClient.chat(prompt);
		console.log("###### BEGIN MAIN STIMULATING QUESTIONS PROMPT ######")
		prompt.messages.forEach((message, index) => {
			console.log(`Message ${index + 1}:`);
			console.log(`Role: ${message.role}`);
			console.log(`Content: ${message.content}`);
			console.log('------------------');
		  });
		console.log("###### END MAIN STIMULATING QUESTIONS PROMPT ######")

		console.log("###### START STIMULATING QUESTION ######")
		// console.log("--- BEGIN msg ---")
		// console.log(msg)
		// console.log("--- END msg ---")
		// console.log("--- BEGIN JSON.stringify(xmlToJson(msg.message.content), null, 2) ---")
		// console.log(JSON.stringify(xmlToJson(msg.message.content), null, 2));
		// console.log("--- END JSON.stringify(xmlToJson(msg.message.content), null, 2) ---")
		const llmResponse = StimulatingQuestionResponseSchema.parse(
			xmlToJson(msg.message.content),
		);

		// console.log("--- BEGIN llmResponse ---")
		// console.log(llmResponse);
		// console.log("--- END llmResponse ---")
		console.log("###### END STIMULATING QUESTION ######")

		return llmResponse.output.questions;
	} catch (error) {
		console.log(error);
	}
	return null;
}
