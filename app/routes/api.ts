import type { ActionFunctionArgs } from "@remix-run/node";
import { Anthropic, serviceContextFromDefaults } from "llamaindex";
import { jsonToXml } from "~/lib/xml-js/jsonToXml";
import { xmlToJson } from "~/lib/xml-js/xmlToJson";
import {
	type Payload,
	llmResponseSchema,
	payloadSchema,
} from "~/schemas/schemas";

const anthropicClient = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
	model: "claude-3-haiku",
	temperature: 0,
	maxTokens: 2048,
});

const serviceContext = serviceContextFromDefaults({ llm: anthropicClient });

const SYSTEM_PROMPT = `<instruction>
Your task is to help the user generate ideas and achieve their goal by asking targeted questions based on the SCAMPER framework and providing expert opinions. 
To start the idea generation session, give the user a foundation for the problem they're trying to solve. Generate 'AI Questions' that the user can answer to provide a basis for their problem that could lead to solutions. Base the questions on the SCAMPER framework and the specific context given by the user (problem, goal, and other details).
Use these contextualized SCAMPER questions to generate your 'AI Questions':
<scamper-questions>
- How might you substitute [key component or resource] in your [product/process/approach] to make an improvement, considering your goal to [goal]?
- What ideas, features, or processes could you combine from [related domain or industry] to enhance your solution to [problem]?
- How could you adapt [successful solution from other domain] to address [specific aspect of problem], given [key constraint from context]?
- What aspect of your [product/process/approach] could you modify, emphasize or tone down to better achieve [goal]?
- How might [different target user] use your solution to [problem] in a novel way, considering [key detail from context]?
- What component of your [product/process/approach] could you eliminate to simplify the solution while still achieving [goal]?
- How might you rearrange or reverse the steps in your [process/approach] to [problem] to unlock new possibilities or efficiencies?
</scamper-questions>
Expect the following input from the user in this XML format:
<input>
  <problem>
    {PROBLEM}
  </problem>
  <goal>
    {GOAL}
  </goal>
  <context>
    {CONTEXT}
  </context>
</input>
Strictly output your response in this XML format:
<output>
  <thought>{step-by-step_reasoning_before_generating_tree}</thought>
  <tree>
      <root>
        <id>{UNIQUE_ID}</id>
        <label>AI Section Suggestion</label>
        <helper>{SHORT_SECTION_DESCRIPTION}</helper>
        <content>{SECTION_TOPIC}</content>
          <children>
            <id>{UNIQUE_ID}</id>
            <label>AI Question</label>
            <helper></helper>
            <content>{QUESTION_TEXT_RELATED_TO_SECTION_TOPIC}</content>
          </children>
          <children>
            <id>{UNIQUE_ID}</id>
            <label>AI Question</label>
            <helper></helper>
            <content>{QUESTION_TEXT_RELATED_TO_SECTION_TOPIC}</content>
          </children>
      </root>
      <root>
        <id>{UNIQUE_ID}</id>
        <label>AI Section Suggestion</label>
        <helper>{SHORT_SECTION_DESCRIPTION}</helper>
        <content>{SECTION_TOPIC}</content>
        <children>
            <id>{UNIQUE_ID}</id>
            <label>AI Question</label>
            <helper></helper>
            <content>{QUESTION_TEXT_RELATED_TO_SECTION_TOPIC}</content>
        </children>
      </root>
  </tree>
</output>
<guidelines>
- The 'tree' should have a single 'root' element containing an array of 'AI Section Suggestion' nodes. 
- Each 'AI Section Suggestion' node should have:
  - A unique 'id'
  - A 'label' field with value "AI Section Suggestion"
  - A 'helper' field with a short description of the section (only shown on hover)
  - A 'content' field with the section topic, based on SCAMPER keywords
  - A 'children' array containing 'AI Question' nodes related to the section topic
- Each 'AI Question' node should have: 
  - A unique 'id'
  - A 'label' field with value "AI Question"
  - An empty 'helper' field
  - A 'content' field with a question related to the parent section's topic
- Use the contextualized SCAMPER questions to generate thought-provoking questions tailored to the user's specific problem, goal and context
- Use the SCAMPER themes as inspiration for section topics, but do not explicitly categorize suggestions by them
- Aim for open-ended questions that encourage brainstorming and cover diverse aspects of the problem space
- Ensure questions are clear, concise and easy to understand 
- Provide expert opinions in the section content to give the user additional context and thought starters
- Before outputting the final tree, let's think step-by-step on your approach in the 'thought' element
- Don't use SCAMPER keywords in SECTION_TOPIC
</guidelines>
</instruction>`;

export async function action({ request }: ActionFunctionArgs) {
	try {
		const body = await request.json();
		const { projectId, problem, goal, context } = payloadSchema.parse(body);

		console.log(projectId, problem, goal, context);

		const msg = await anthropicClient.chat({
			messages: [
				{
					role: "system",
					content: SYSTEM_PROMPT,
				},
				{
					role: "user",
					content: jsonToXml({
						problem,
						goal,
						context,
					}),
				},
			],
		});
		console.log(JSON.stringify(xmlToJson(msg.message.content), null, 2));
		const llmResponse = llmResponseSchema.parse(
			xmlToJson(msg.message.content).output,
		);

		console.log(llmResponse);

		return llmResponse.tree;

		// Save the response
		// const response = fetch(
		// 	"https://scamper-ai.hasura.app/api/rest/insertllmhistory",
		// 	{
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 		},
		// 		body: JSON.stringify({
		// 			project_id: projectId,
		// 			prompt: gptPayload,
		// 			response: LLMOutput,
		// 		}),
		// 	},
		// );

		// return LLMOutput;
	} catch (error) {
		return error;
	}
}
