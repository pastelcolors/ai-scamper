import z from "zod";

export const payloadSchema = z.object({
	projectId: z.string(),
	problem: z.string(),
	goal: z.string(),
	context: z.string().optional(),
	// agentName: z.string(),
	// agentDescription: z.string(),
	// task: z.string(),
	// graph: z.string(),
});

export const roleSchema = z.object({
	role: z.string(),
	description: z.string(),
});

export const aiAgentRequestsPayloadSchema = z.object({
	graph: z.string(),
	answer: z.string(),
	answerNodeId: z.string(),
	roles: z.array(roleSchema),
	projectId: z.string(),
});

interface Node {
	id: string;
	label:
		| "AI Section Suggestion"
		| "AI Question"
		| "AI Stimulating Question"
		| "Domain Expert Opinion";
	helper?: string;
	content: string;
	children?: Node[];
}

function normalizeArray<T>(v?: T | T[] | null): T[] {
	if (v === undefined || v === null) {
		return [];
	}

	return Array.isArray(v) ? v : [v];
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
		helper: z.string().optional(),
		content: z.string(),
		children: z.preprocess(
			normalizeArray,
			z.union([z.array(nodeSchema), nodeSchema]),
		),
	}),
);

export const treeSchema = z.object({
	root: z.array(nodeSchema),
});

export const llmResponseSchema = z.object({
	thought: z.string().optional(),
	tree: treeSchema,
});

const OpinionSchema = z
	.object({
		name: z.string(),
		thoughts: z.string(),
	})
	.passthrough();

export const DomainExpertResponseSchema = z
	.object({
		opinions: z
			.object({
				opinion: z.preprocess(
					(v) => (Array.isArray(v) ? v : [v]),
					z.array(OpinionSchema),
				),
			})
			.passthrough(),
	})
	.passthrough();

const QuestionSchema = z
	.object({
		name: z.string(),
		thoughts: z.string(),
	})
	.passthrough();

export const StimulatingQuestionResponseSchema = z
	.object({
		output: z
			.object({
				questions: z
					.object({
						question: z.preprocess(
							(v) => (Array.isArray(v) ? v : [v]),
							z.array(QuestionSchema),
						),
					})
					.passthrough(),
			})
			.passthrough(),
	})
	.passthrough();

export type DomainExpertResponse = z.infer<typeof DomainExpertResponseSchema>;
export type Payload = z.infer<typeof payloadSchema>;
export type Tree = z.infer<typeof treeSchema>;
export type AIAgentRequestsPayloadSchema = z.infer<
	typeof aiAgentRequestsPayloadSchema
>;
export type Role = z.infer<typeof roleSchema>;
