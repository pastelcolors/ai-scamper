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

export type Payload = z.infer<typeof payloadSchema>;
export type Tree = z.infer<typeof treeSchema>;