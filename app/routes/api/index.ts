import type { ActionFunctionArgs } from "@remix-run/node";
import { Anthropic, serviceContextFromDefaults } from "llamaindex";
import {
	type Payload,
	payloadSchema,
	llmResponseSchema,
} from "~/schemas/schemas";

const anthropicClient = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
	model: "claude-3-sonnet",
	temperature: 0.7,
	maxTokens: 2048,
});

const serviceContext = serviceContextFromDefaults({ llm: anthropicClient });

const systemPromptBuilder = () => {
	const operations = ["S", "C", "A", "M", "P", "E", "R"];
	const randomOperations = operations
		.sort(() => Math.random() - Math.random())
		.slice(0, 3);

	return `
	You are an AI assistant tasked with helping the user generate ideas and achieve their goal by asking questions based on the SCAMPER framework and providing expert opinions.

	<instructions>
		Your first task to start the idea generation session is to give users a foundation for the problem they’re trying to solve. So generate ‘AI Questions’ that the user can answer to provide basis for their problem that could lead to solutions, based the guide questions of the SCAMPER FRAMEWORK in <scamper-guide-questions>.

		Group the generated questions into ‘AI Section Suggestion’ that could identify these questions, based on what area or category they are being asked sample sections can also be seen in <examples></examples>.

		Your JSON response should be compliant to the Zod schema below:
		interface Node {
			id: string;
			label: "AI Section Suggestion" | "AI Question" | "AI Stimulating Question" | "Domain Expert Opinion";
			helper: string;
			content: string;
			children?: Node[];
		}
		
		export const nodeSchema: z.ZodType<Node> = z.lazy(() =>
			z.object({
				id: z.string(),
				label: z.enum([
					"AI Section Suggestion",
					"AI Question",
					"AI Stimulating Question",
					"Domain Expert Opinion",
				]),
				helper: z.string(),
				content: z.string(),
				children: z.array(nodeSchema).optional(),
			})
		);
		
		export const treeSchema = z.object({
			root: z.array(nodeSchema),
		});
		
		export const llmResponseSchema = z.object({
			thought: z.string().optional(),
			tree: treeSchema,
		});

		STRICTLY FOLLOW THE INSTRUCTIONS BELOW AS THEY ARE CRUCIAL FOR THE PROJECT'S FUNCTIONALITY.
		- The root should be an array of 'AI Section Suggestion' nodes.
		- Each 'AI Section Suggestion' node should have a unique 'id', a 'label' (always "AI Section Suggestion"), a 'helper' field with a short text about the section, 'content' field, and an array of 'AI Question' nodes as 'children'.
		- Each 'AI Question' node should have a unique 'id', a 'label' (always "AI Question"), an empty 'helper' field, and a 'content' field with the question text.
		- Limit the number of 'AI Question' nodes per 'AI Section Suggestion' to a maximum of 3.
	</instructions>

<scamper-guide-questions>
${SCAMPERExamples(randomOperations[0])}
${SCAMPERExamples(randomOperations[1])}
${SCAMPERExamples(randomOperations[2])}
</scamper-guide-questions>

<example-sections>
- Market Analysis
- Target Market
- Coding Expertise
</example-sections>

<example-helpers>
- In order to create a marketing plan, we must consider the status of the market...
</example-helpers>
	`;
};

const SCAMPERExamples = (operation: string) => {
	switch (operation) {
		case "S":
			return `
    * What can I substitute so as to make an improvement?
    * How can I substitute the place, time, materials or people?
    * Can I substitute one part for another or change any parts?
    * Can I replace someone involved?
    * Can I change the rules?
    * Can I use other ingredients or materials?
    * Can I use other processes or procedures?
    * Can I change its shape, color, roughness, sound or smell?
    `;
		case "C":
			return `
    * How can I combine two or more parts of my product, problem, or process so as to achieve a different product, problem, or process to enhance synergy?
    * What ideas, materials, features, processes, people, products, or components can I combine?
    * Can I combine or merge this or that with other objects?
    * What can I combine so as to maximize the number of uses?
    * What can I combine in order to lower the costs of production?
    * Which materials could I combine?
    * Where can I build synergy?
    * Which are the best elements I can bring together so as to achieve a particular result?
    `;
		case "A":
			return `
    * What can I adapt in my product, problem, or process?
    * Which part of the product could I change?
    * Could I change the characteristics of a component?
    * Can I seek inspiration in other products or processes, but in a different context?
    * Does the history offer any solutions?
    * Which ideas could I adapt, copy, or borrow from other people’s products?
    * What processes should I adapt?
    * Can I adapt the context or target group?
    * What can I adapt in this or that way in order to make this result?
    `;
		case "M":
			return `
    * What can I modify or put more or less emphasis on in my product, problem, or process?
    * Can I change the item in some way?
    * Can I change meaning, colour, motion, sound, smell, form, or shape?
    * What can I magnify or make larger?
    * What can I tone down or delete?
    * Could I exaggerate or overstate buttons, colours, size…?
    * Could I grow the target group?
    * What can be made higher, bigger, or stronger?
    * Can I increase its speed or frequency?
    * Can I add extra features?
    * How can I add extra value?
    * What can you remove or make smaller, condensed, lower, shorter or lighter—or streamline, split up or understate?
    * What can I change in this way or that way so as to achieve such and such a result?
    `;
		case "P":
			return `
    Put to Another Use
    * How can I put the thing to other uses?
    * What are new ways to use the product or service?
    * Can I reach out to other users if I modify the product?
    * Is there another market for the product? 
    * What else can it be used for?
    * How would a child use it?—an older person?
    * How would people with different disabilities use it?
    * Which other target group could benefit from this product?
    * What other kind of user would need or want my product?
    * Who or what else may be able to use it?
    * Can it be used by people other than those it was originally intended for?
    * Are there new ways to use it in its current shape or form?
    * Would there be other possible uses if I were to modify the product?
    * How can I reuse something in a certain way by doing what to it?
    `;
		case "E":
			return `
    * What can I eliminate or simplify in my product, design, or service?
    * What can I remove without altering its function?
    * Can I reduce time or components?
    * What would happen if I removed a component or part of it?
    * Can I reduce effort?
    * Can I cut costs?
    * How can I simplify it?
    * What’s non-essential or unnecessary?
    * Can I eliminate the rules?
    * Can I make it smaller?
    * Can I split my product into different parts?
    * I can eliminate what by doing what?
    `;
		case "R":
			return `
    * How can I change, reorder, or reverse the product or problem?
    * What would I do if I had to do this process in reverse?
    * What can I rearrange in some way – can I interchange components, the pattern, or the layout?
    * Can I change the pace or schedule?
    * What would I do if part of your problem, product or process worked in reverse?
    * I can rearrange what in what way such that this happens?
    `;
	}
};
const userPrompt = ({ problem, goal, context }: Payload) => {
	return `
		<context>
			Here is information on the user’s needs for this idea generation session:
			The problem is: ${problem}
			The goal is: ${goal}
			Other context: ${context}
		</context>
	`;
};

export async function action({ request }: ActionFunctionArgs) {
	try {
		const body = await request.json();
		const { projectId, problem, goal, context } = payloadSchema.parse(body);

		console.log(projectId, problem, goal, context);

		const msg = await anthropicClient.chat({
			messages: [
				{
					role: "user",
					content: userPrompt({ projectId, problem, goal, context }),
				},
				{
					role: "assistant",
					content: "{",
				},
				{
					role: "system",
					content: systemPromptBuilder(),
				},
			],
		});

		const llmResponse = llmResponseSchema.parse({
			...JSON.parse(`{${msg.message.content}`),
		});

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
