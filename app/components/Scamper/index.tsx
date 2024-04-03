import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardDescription, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import z from "zod";
import { useEffect, useState } from "react";
import { type ReactFlowJsonObject, useReactFlow } from "reactflow";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { HiPlus } from "react-icons/hi2";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { HiX } from "react-icons/hi";

function EmptyState() {
	return (
		<Card className="flex flex-col items-center justify-center my-6">
			<CardHeader className="text-center">
				<CardDescription>No agents configured yet!</CardDescription>
			</CardHeader>
		</Card>
	);
}

const agentFormSchema = z.object({
	agent_name: z.string().min(2),
	agent_description: z.string().max(100).optional(),
	agent_tasks: z.array(z.string()).min(1),
});

interface UiAgents extends z.infer<typeof agentFormSchema> {
	icon: string;
}

const DEFAULT_AGENTS: UiAgents[] = [
	{
		icon: "🧑‍💼",
		agent_name: "Product Manager",
		agent_description: "I manage the product lifecycle",
		agent_tasks: [
			"Create product roadmap",
			"Define product strategy",
			"Manage product backlog",
		],
	},
	{
		icon: "🧑‍🎨",
		agent_name: "Product Designer",
		agent_description: "I design the product",
		agent_tasks: ["Create wireframes", "Design UI/UX", "Create prototypes"],
	},
	{
		icon: "🧑‍🤝‍🧑",
		agent_name: "Customer",
		agent_description: "I use the product",
		agent_tasks: ["Provide feedback", "Report bugs", "Request features"],
	},
];

function NewAgentForm({
	setCreateNewAgent,
}: { setCreateNewAgent: (value: boolean) => void }) {
	const form = useForm<z.infer<typeof agentFormSchema>>({
		resolver: zodResolver(agentFormSchema),
		defaultValues: {
			agent_name: "",
			agent_description: "",
			agent_tasks: [],
		},
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "agent_tasks",
		rules: {
			required: "At least one agent task is required",
			validate: (value) => agentFormSchema.safeParse(value).success,
		},
	});
	return (
		<Card className="flex flex-col p-4 my-6">
			<CardHeader className="font-semibold pl-0">
				🤖 Create New Agent
			</CardHeader>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(() => console.log("hello-world"))}
					className="space-y-8"
				>
					<FormField
						control={form.control}
						name="agent_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Designer" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="agent_description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Input placeholder="I consult on your ideas..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex flex-col gap-y-2">
						<FormLabel>Tasks</FormLabel>
						{fields.map((field, index) => (
							<FormField
								key={field.id}
								control={form.control}
								name={`agent_tasks.${index}`}
								render={({ field }) => (
									<FormItem>
										<div className="flex items-stretch gap-x-2">
											<FormControl>
												<Input placeholder="Enter task..." {...field} />
											</FormControl>
											<Button
												type="button"
												variant="ghost"
												onClick={() => remove(index)}
											>
												<HiX />
											</Button>
										</div>
										<FormMessage className="text-red-500">
											At least one task is required
										</FormMessage>
									</FormItem>
								)}
							/>
						))}

						<Button type="button" className="w-fit" onClick={() => append("")}>
							Add Task
						</Button>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger className="block">
							<Button variant="secondary">
								Frequently used Agents <HiPlus className="ml-2" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-[220px]">
							<DropdownMenuItem className="flex items-center gap-x-2">
								<span aria-hidden>🧑‍💼</span>
								Product Manager
							</DropdownMenuItem>
							<DropdownMenuItem className="flex items-center gap-x-2">
								<span aria-hidden>🧑‍🎨 </span>
								Product Designer
							</DropdownMenuItem>
							<DropdownMenuItem className="flex items-center gap-x-2">
								<span aria-hidden>🧑‍🤝‍🧑</span>
								Customer
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="flex justify-end w-full gap-x-2">
						<Button type="submit">Create Agent</Button>
						<Button
							type="button"
							onClick={() => setCreateNewAgent(false)}
							variant="secondary"
						>
							Close
						</Button>
					</div>
				</form>
			</Form>
			<CardDescription />
		</Card>
	);
}

const operations = ["S", "C", "A", "M", "P", "E", "R"];

const apiUrl = "http://localhost:8787/api"; // Define the API URL

// If you are validating your payload with zod prior to sending it.
const schema = z.object({
	operation: z.enum(["S", "C", "A", "M", "P", "E", "R"]),
	graph: z.string(),
});

const operationNames: { [key: string]: string } = {
	S: "Substitute",
	C: "Combine",
	A: "Adapt",
	M: "Modify",
	P: "Put into another use",
	E: "Eliminate",
	R: "Reduce",
};

function Data() {
	const [loadingStates, setLoadingStates] = useState<{
		[key: string]: boolean;
	}>(
		operations.reduce(
			(acc, operation) => Object.assign(acc, { [operation]: true }), // Replace spread syntax with Object.assign()
			{},
		),
	);

	useEffect(() => {
		for (const operation of operations) {
			const payload = {
				operation,
				graph: undefined, // Since graph is supposed to be undefined for now
			};

			fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			})
				.then((response) => response.json())
				.then(() => {
					setLoadingStates((prevStates) => ({
						...prevStates,
						[operation]: false,
					}));
				})
				.catch((error) => {
					console.error("Error fetching data:", error);
					setLoadingStates((prevStates) => ({
						...prevStates,
						[operation]: false,
					}));
				});
		}
	}, []);

	return (
		<div className="flex flex-col mt-6 h-[85%] overflow-y-auto">
			{operations.map((operation) => (
				<div key={operation} className="flex flex-col gap-y-2">
					<div>
						<Badge>
							{operationNames[operation]} ({operation})
						</Badge>
					</div>
					{loadingStates[operation] ? (
						<Skeleton className="w-full h-24" />
					) : (
						<div>Content for {operation}</div> // Placeholder for when loading is false
					)}
				</div>
			))}
		</div>
	);
}

export const convertReactFlowToMermaid = <
	T extends { label: string; content: string },
	U,
>(
	flow: ReactFlowJsonObject<T, U>,
): string => {
	let mermaidStr = "graph TD\n";
	const masterNode = flow.nodes.find((node) => node.type === "MasterNode");

	if (masterNode) {
		mermaidStr += `    ${masterNode.id}[{problem: ${masterNode.data.problem}, goal: ${masterNode.data.goal}, context: ${masterNode.data.context}}]:::${masterNode.type}\n`;
	}

	for (const node of flow.nodes.filter((node) => node.type !== "MasterNode")) {
		const label = node.data.label;
		const nodeType = node.type;
		const content = node.data.content;
		mermaidStr += `    ${node.id}[${label}-${content}]:::${nodeType}\n`;
	}

	if (flow.edges) {
		for (const edge of flow.edges) {
			mermaidStr += `    ${edge.source} --> ${edge.target}\n`;
		}
	}

	return mermaidStr;
};

export default function Scamper() {
	const reactFlow = useReactFlow();
	const [createNewAgent, setCreateNewAgent] = useState(false);

	useEffect(() => {
		console.log(reactFlow.toObject());
		console.log(convertReactFlowToMermaid(reactFlow.toObject()));
	});

	return (
		<Sheet>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>⚙️ Configuration</SheetTitle>
				</SheetHeader>
				{/* <EmptyState /> */}
				{/*   <Data /> */}
				{/*   <SheetFooter> */}
				{/*     <Button>Generate ideas</Button> */}
				{/*   </SheetFooter> */}
				<Tabs defaultValue="agents" className="w-full pt-5">
					<TabsList>
						<TabsTrigger value="agents">🤖 Agents</TabsTrigger>
						<TabsTrigger value="knowledgebase">📖 Knowledgebase</TabsTrigger>
					</TabsList>
					<TabsContent value="agents">
						<EmptyState />
						{createNewAgent ? (
							<NewAgentForm setCreateNewAgent={setCreateNewAgent} />
						) : (
							<Button onClick={() => setCreateNewAgent(true)}>
								Add new agent 🤖
							</Button>
						)}
					</TabsContent>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
}
