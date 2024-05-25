import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Handle, type NodeProps, Position } from "reactflow";

import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";

import { HiOutlineCog, HiOutlineUpload } from "react-icons/hi";
import {
	HiCheck,
	HiChevronDown,
	HiOutlineBolt,
	HiXCircle,
} from "react-icons/hi2";
import useStore from "../../lib/store";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useFetcher } from "@remix-run/react";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

export type MasterNodeData = {
	problem: string;
	goal: string;
	context?: string;
	files?: string[];
};

interface PeerProfile {
	name: string;
	description: string;
	selected: boolean;
}

const PEER_PROFILES: PeerProfile[] = [
	{
		name: "🏢 CEO",
		description: "The CEO of a large company",
		selected: false,
	},
	{
		name: "📈 Marketing Manager",
		description: "The marketing manager of a large company",
		selected: false,
	},
	{
		name: "Customer who haven't used AI tools",
		description: "A customer who is new to AI tools",
		selected: false,
	},
	{
		name: "AI tool product manager",
		description: "A product manager of an AI tool",
		selected: false,
	},
];

export default function MasterNode(props: NodeProps<MasterNodeData>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const startBrainstorming = useStore((state) => state.startBrainstorming);
	const updateAgents = useStore((state) => state.updateAgents);
	const deleteAgent = useStore((state) => state.deleteAgent);
	const addAgent = useStore((state) => state.addAgent);

	const agents = useStore((state) => state.agents);
	const [formName, setFormName] = useState("");
	const [formDescription, setFormDescription] = useState("");

	const [tempRole, setTempRole] = useState("");
	const [tempDescription, setTempDescription] = useState("");
	const [tempSelected, setTempSelected] = useState(false);

	const DEFAULT_VALUES = {
		problem:
			"Coming up with novel and creative ideas can be challenging, especially when brainstorming alone or feeling stuck. Traditional brainstorming methods are often inefficient and fail to fully leverage the knowledge and associations that could lead to breakthrough ideas.",
		goal: "To create an AI-powered brainstorming tool that augments human creativity by intelligently suggesting related concepts, questions, and ideas. The tool should help users break out of creative ruts, make new connections between ideas, and engage in more productive ideation sessions, both individually and collaboratively.",
		context:
			"The AI brainstorming tool will utilize advanced language models like GPT-4 to understand the context and semantics of the user's input ideas and generate relevant suggestions. It will provide an intuitive visual interface, such as a mind map, for users to input their initial ideas and easily explore the AI-generated suggestions. The tool will allow users to set clear parameters and refine the AI's outputs through feedback to improve the relevance and quality of the brainstormed ideas.	It will support various brainstorming techniques and prompt structures to cater to different creative challenges and user preferences. The AI brainstorming tool will integrate with popular productivity and collaboration platforms to fit seamlessly into users' existing workflows.",
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		updateNodeData(props.id, {
			...props.data,
			context: DEFAULT_VALUES.context,
			problem: DEFAULT_VALUES.problem,
			goal: DEFAULT_VALUES.goal,
		});
	}, []);

	useEffect(() => {
		console.log("agents", agents);
	}, [agents]);

	return (
		<>
			<Card className="w-[600px] border-2 border-black">
				<CardHeader>
					<CardTitle className="font-medium text-sm inline-flex items-center gap-1">
						<HiOutlineCog />
						<span>Prompt Settings</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="problem">Problem</Label>
								<Textarea
									id="problem"
									placeholder="I want to expand my business in the Philippines"
									value={props.data.problem}
									onChange={(e) => {
										updateNodeData(props.id, {
											...props.data,
											problem: e.target.value,
										});
									}}
								/>
							</div>
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="problem">Goal</Label>
								<Textarea
									id="problem"
									placeholder="Create a marketing plan. (What do you want to achieve at the end of this brainstorming session?)"
									value={props.data.goal}
									onChange={(e) => {
										updateNodeData(props.id, {
											...props.data,
											goal: e.target.value,
										});
									}}
								/>
							</div>
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="context">Other Context</Label>
								<Textarea
									id="context"
									value={props.data.context}
									placeholder="The business is about food"
									onChange={(e) => {
										updateNodeData(props.id, {
											...props.data,
											context: e.target.value,
										});
									}}
								/>
							</div>
							<div className="flex flex-col space-y-1.5">
								<div className="flex items-center space-x-1 mb-2">
									<Label htmlFor="ai-agent">AI Peer Roles</Label>
									<span className="text-gray-500 text-xs">
										(Choose personas for the AI to mimic and provide opinions)
									</span>
								</div>
								<ScrollArea className="w-full">
									<div className="space-y-4">
										{agents.map((profile) => (
											<div
												key={profile.role}
												className="flex items-top space-x-2"
											>
												<Checkbox
													id={`profile-${profile.role}`}
													checked={profile.selected}
													onCheckedChange={() =>
														updateAgents(
															{
																role: profile.role,
																description: profile.description,
																selected: profile.selected,
															},
															{
																role: profile.role,
																description: profile.description,
																selected: !profile.selected,
															},
														)
													}
												/>
												<div className="flex flex-row justify-between leading-none w-full">
													<div className="flex flex-col gap-0.5">
														<label
															htmlFor={`profile-${profile.role}`}
															className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
														>
															{profile.role}
														</label>
														<p className="text-sm text-muted-foreground">
															{profile.description}
														</p>
													</div>
													<div className="flex flex-row gap-2">
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => {
																		setTempRole(profile.role);
																		setTempDescription(profile.description);
																		setTempSelected(profile.selected);
																	}}
																>
																	Edit
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Edit Peer Profile
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		<Label htmlFor="name">Name</Label>
																		<div className="grid w-full max-w-sm items-center gap-1.5">
																			<Input
																				type="text"
																				id="role"
																				placeholder="Role"
																				value={tempRole}
																				onChange={(e) =>
																					setTempRole(e.target.value)
																				}
																			/>
																		</div>
																		<div className="grid w-full max-w-sm items-center gap-1.5">
																			<Label htmlFor="profile">
																				Profile and Behavior
																			</Label>
																			<Input
																				type="text"
																				id="profile"
																				placeholder="Explain what this peer does"
																				value={tempDescription}
																				onChange={(e) => {
																					setTempDescription(e.target.value);
																				}}
																			/>
																		</div>
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() => {
																			const oldAgent = {
																				role: profile.role,
																				description: profile.description,
																				selected: profile.selected,
																			};
																			updateAgents(oldAgent, {
																				role: tempRole,
																				description: tempDescription,
																				selected: tempSelected,
																			});
																			setTempRole("");
																			setTempDescription("");
																			setTempSelected(false);
																		}}
																	>
																		Save
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
														<Button
															variant="destructive"
															size="sm"
															onClick={() => {
																deleteAgent({
																	role: profile.role,
																	description: profile.description,
																});
																setTempRole("");
																setTempDescription("");
															}}
														>
															Delete
														</Button>
													</div>
												</div>
											</div>
										))}

										<div className="p-4 w-[350px]">
											<Label className="text-gray-500 font-normal text-sm">
												Add New Peer Profile
											</Label>
											<form
												onSubmit={(e) => e.preventDefault()}
												className="px-2 py-2 flex flex-col space-y-2"
											>
												<div className="grid w-full max-w-sm items-center gap-1.5">
													<Label htmlFor="name">Name</Label>
													<Input
														type="text"
														id="name"
														placeholder="Name"
														value={formName}
														onChange={(e) => setFormName(e.target.value)}
													/>
												</div>
												<div className="grid w-full max-w-sm items-center gap-1.5">
													<Label htmlFor="profile">Profile and Behavior</Label>
													<Input
														type="text"
														id="profile"
														placeholder="Explain what this peer does"
														value={formDescription}
														onChange={(e) => setFormDescription(e.target.value)}
													/>
												</div>
												<div className="flex items-center pt-3 gap-x-2">
													<Button
														onClick={() => {
															addAgent({
																role: formName,
																description: formDescription,
																selected: true,
															});
															setFormName("");
															setFormDescription("");
														}}
													>
														Save and Add
													</Button>
													<Button
														variant="destructive"
														onClick={() => {
															setFormName("");
															setFormDescription("");
														}}
													>
														Cancel
													</Button>
												</div>
											</form>
										</div>
									</div>
								</ScrollArea>
							</div>
						</div>
					</form>
				</CardContent>

				<CardFooter className="w-full">
					<Button
						onClick={() => {
							startBrainstorming(props);
						}}
						className="w-full"
					>
						<HiOutlineBolt /> <span>Start Brainstorming</span>
					</Button>
				</CardFooter>
				<Handle type="target" position={Position.Top} />
				<Handle type="source" position={Position.Top} />
			</Card>
		</>
	);
}
