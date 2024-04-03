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
	}
];

export default function MasterNode(props: NodeProps<MasterNodeData>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const startBrainstorming = useStore((state) => state.startBrainstorming);
	const updateAgents = useStore((state) => state.updateAgents);
	const updateAgent = useStore((state) => state.updateAgent);
	const addAgent = useStore((state) => state.addAgent);

	const agents = useStore((state) => state.agents);
	const fetcher = useFetcher();
	const [formName, setFormName] = useState("");
	const [formDescription, setFormDescription] = useState("");

	const [tempName, setTempName] = useState("");
	const [tempDescription, setTempDescription] = useState("");

	const DEFAULT_VALUES = {
		problem: "Coming up with novel and creative ideas can be challenging, especially when brainstorming alone or feeling stuck. Traditional brainstorming methods are often inefficient and fail to fully leverage the knowledge and associations that could lead to breakthrough ideas.",
		goal: "To create an AI-powered brainstorming tool that augments human creativity by intelligently suggesting related concepts, questions, and ideas. The tool should help users break out of creative ruts, make new connections between ideas, and engage in more productive ideation sessions, both individually and collaboratively.",
		context: "The AI brainstorming tool will utilize advanced language models like GPT-4 to understand the context and semantics of the user's input ideas and generate relevant suggestions. It will provide an intuitive visual interface, such as a mind map, for users to input their initial ideas and easily explore the AI-generated suggestions. The tool will allow users to set clear parameters and refine the AI's outputs through feedback to improve the relevance and quality of the brainstormed ideas.	It will support various brainstorming techniques and prompt structures to cater to different creative challenges and user preferences. The AI brainstorming tool will integrate with popular productivity and collaboration platforms to fit seamlessly into users' existing workflows.",
	};

	useEffect(() => {
		updateNodeData(props.id, {
			...props.data,
			context: DEFAULT_VALUES.context,
			problem: DEFAULT_VALUES.problem,
			goal: DEFAULT_VALUES.goal,
		});
	}, []);

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
								<div className="flex items-center space-x-1">
									<Label htmlFor="ai-agent">AI Peer Roles</Label>
									<span className="text-gray-500 text-xs">
										(Choose personas for the AI to mimic and provide opinions)
									</span>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="font-normal text-gray-500 border border-gray-300 gap-x-2 w-[120px]"
											size="sm"
										>
											<span className="text-xs">Select peers</span>
											<HiChevronDown />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-[200px]">
										<DropdownMenuGroup>
											{agents.map((profile, index) => (
												<DropdownMenuSub key={index}>
													<DropdownMenuSubTrigger
														className="flex items-center gap-x-2"
														onClick={() =>
															updateAgents({
																role: profile.role,
																description: profile.description,
																selected: !profile.selected,
															})
														}
														onMouseOver={() => {
															setTempName(profile.role);
															setTempDescription(profile.description);
														}}
													>
														{profile.selected && <HiCheck />}
														{profile.role}
													</DropdownMenuSubTrigger>
													<DropdownMenuSubContent
														className="p-4 w-[350px]"
														sideOffset={15}
													>
														<DropdownMenuLabel className="text-gray-500 font-normal text-sm">
															Edit Peer Profile
														</DropdownMenuLabel>
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
																	value={tempName}
																	onChange={(e) => {
																		setTempName(e.target.value);
																	}}
																/>
															</div>
															<div className="grid w-full max-w-sm items-center gap-1.5">
																<Label htmlFor="name">
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
															<div className="flex items-center pt-3 gap-x-2">
																<Button
																	onClick={() => {
																		updateAgent({
																			role: tempName,
																			description: tempDescription,
																			selected: true,
																		});
																	}}
																>
																	Save and Add
																</Button>
																<Button
																	variant="destructive"
																	onClick={() => {
																		updateAgents({
																			role: profile.role,
																			description: profile.description,
																			selected: false,
																		});
																		setTempName("");
																		setTempDescription("");
																	}}
																>
																	Delete
																</Button>
															</div>
														</form>
													</DropdownMenuSubContent>
												</DropdownMenuSub>
											))}
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuSub>
											<DropdownMenuSubTrigger className="font-semibold">
												Add New
											</DropdownMenuSubTrigger>
											<DropdownMenuSubContent
												className="p-4 w-[350px]"
												sideOffset={15}
											>
												<DropdownMenuLabel className="text-gray-500 font-normal text-sm">
													Add New Peer Profile
												</DropdownMenuLabel>
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
														<Label htmlFor="name">Profile and Behavior</Label>
														<Input
															type="text"
															id="profile"
															placeholder="Explain what this peer does"
															value={formDescription}
															onChange={(e) =>
																setFormDescription(e.target.value)
															}
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
											</DropdownMenuSubContent>
										</DropdownMenuSub>
									</DropdownMenuContent>
								</DropdownMenu>
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

