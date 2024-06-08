import type { ActionFunctionArgs } from "@remix-run/node";
import { Anthropic, serviceContextFromDefaults } from "llamaindex";
import { jsonToXml } from "~/lib/xml-js/jsonToXml";
import { xmlToJson } from "~/lib/xml-js/xmlToJson";
import {
	DomainExpertResponseSchema,
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
	Your task is to generate Domain Expert Opinion nodes that provide unique perspectives and insights related to the user's answer to a SCAMPER question, considering the assigned roles and the project's context.
	<input>
		<roles>
			<role>
				<name>{ROLE_NAME}</name>
				<description>{ROLE_DESCRIPTION}</description>
			</role>
			<role>
				<name>{ROLE_NAME}</name>
				<description>{ROLE_DESCRIPTION}</description>
			</role>
			...
		</roles>
		<graph>{GRAPH_MERMAID_FORMAT}</graph>
		<user_answer>{USER_SCAMPER_ANSWER}</user_answer>
		<user_answer_node_id>{USER_ANSWER_NODE_ID}</user_answer_node_id>
	</input>
	To generate the Domain Expert Opinion nodes:
	1. Carefully review the <roles> provided, noting each role's specialization and how it might relate to the project's context of generating and exploring ideas through the SCAMPER framework.
	2. Analyze the current <graph> structure to understand the relationships between existing nodes and how the user's answer fits into the overall flow of ideas.
	3. Examine the user's <user_answer> to the SCAMPER question, considering its content, implications, and potential for further exploration or development.
	4. For each role listed in <roles>, generate 2 unique Domain Expert Opinion nodes that:
	   a. Provide a perspective or insight that is faithful to the role's specialization and description
	   b. Relate directly to the user's answer, offering constructive feedback, additional context, or new angles to consider
	   c. Encourage the user to think more deeply about their answer and its potential applications or consequences
	   d. Are concise, accurate, and truthful, avoiding speculation or assumptions beyond the given information
	5. When generating the Domain Expert Opinion nodes, consider how the role's expertise might:
	   a. Identify strengths, weaknesses, or limitations in the user's answer
	   b. Suggest alternative approaches, modifications, or adaptations to the idea
	   c. Highlight potential impacts, benefits, or challenges related to implementing the idea
	   d. Connect the user's answer to broader concepts, trends, or examples within the role's domain
	6. Organize the generated Domain Expert Opinion nodes by role, ensuring that each opinion is clearly attributed to the correct role.
	   - Generate one opinion nodes for each role, using the role name as the XML tag.
	7. Write the opinions in second-person voice, addressing the user directly while clearly identifying the role being personified.
	<output>
		<opinions>
			<opinion>
				 <name>{roleName1}</name>
				<thoughts>{DOMAIN_EXPERT_OPINION_1_FOR_ROLE_1}</thoughts>
			</opinion>
			<opinion>
				 <name>{roleName2}</name>
				<thoughts>{DOMAIN_EXPERT_OPINION_1_FOR_ROLE_2}</thoughts>
			</opinion>
			...
		</opinions>
	</output>
	<guidelines>
	- Focus and anchor your responses on the <user_answer>. Observe very carefully its relation through the <user_answer_node_id>. So you'll have to do needle-in-a-haystack with the <graph>, which is merely a guide.
	- Ensure that each Domain Expert Opinion is relevant, constructive, and encourages further thought
	- Tailor the opinions to the specific roles, leveraging their unique perspectives and expertise
	- Avoid making assumptions or speculating beyond the information provided in the input
	- Use clear, very concise language that is easy for the user to understand and apply. 
	- Be as clear, as brief, and as orderly as one can in what one says, and where one avoids obscurity and ambiguity.
	- Be as informative as one possibly can, and gives as much information as is needed, and no more.
	- Aim to provide a balanced mix of affirmation, critique, and suggestion in the opinions
	- Maintain a professional and respectful tone throughout, focusing on the ideas rather than the user
	- Generate two opinion nodes for each role, using the role name as the XML tag
	- Write the opinions in second-person voice, addressing the user directly while identifying the role being personified
	- Each opinion should be a maximum of two sentence long
	</guidelines>
	Remember, your goal is to provide the user with valuable insights and feedback that will help them refine and expand their ideas within the SCAMPER framework. Let the roles' unique perspectives guide your generation of constructive and thought-provoking Domain Expert Opinions.
	</instruction>`;
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		const body = await request.json();
		const { projectId, graph, answer, answerNodeId, roles } =
			aiAgentRequestsPayloadSchema.parse(body);

		const msg = await anthropicClient.chat({
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
		});

		console.log(JSON.stringify(xmlToJson(msg.message.content), null, 2));

		const llmResponse = DomainExpertResponseSchema.parse(
			xmlToJson(msg.message.content),
		);

		return llmResponse.opinions;
	} catch (error) {
		console.log(error);
	}
	return null;
}
