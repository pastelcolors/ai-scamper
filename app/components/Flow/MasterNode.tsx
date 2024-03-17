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
import { HiCheck, HiChevronDown, HiOutlineBolt } from "react-icons/hi2";
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
];

export default function MasterNode(props: NodeProps<MasterNodeData>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const startBrainstorming = useStore((state) => state.startBrainstorming);
	const fetcher = useFetcher();

	const [peerProfiles, setPeerProfiles] = useState(PEER_PROFILES);
	const [formName, setFormName] = useState("");
	const [formDescription, setFormDescription] = useState("");

	const [tempName, setTempName] = useState("");
	const [tempDescription, setTempDescription] = useState("");

	const TEST_MODE = true;

	// useLayoutEffect(() => {
	//     if (inputRef.current) {
	//         inputRef.current.style.width = `${data.label.length * 8}px`;
	//     }
	// }, [data.label.length]);

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
									value={TEST_MODE ? "Improving accessibility in public spaces" : ""}
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
									value={TEST_MODE ? "Design inclusive solutions that make public spaces more accessible and user-friendly for individuals with various disabilities or mobility challenges." : ""}
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
									value={TEST_MODE ? "Many public spaces, such as parks, museums, and transportation hubs, can be challenging to navigate for people with disabilities or mobility issues. Innovative approaches are needed to enhance accessibility through thoughtful design, assistive technologies, and inclusive practices." : ""}
									placeholder="The business is about food"
									onChange={(e) => {
										updateNodeData(props.id, {
											...props.data,
											context: e.target.value,
										});
									}}
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Button className="w-fit">
									<span className="mr-1">Upload</span>
									<HiOutlineUpload />
								</Button>
								<span className="text-gray-500 text-sm">
									Add Context Documents (PDF only)
								</span>
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
											{peerProfiles.map((profile, index) => (
												<DropdownMenuSub key={index}>
													<DropdownMenuSubTrigger
														className="flex items-center gap-x-2"
														onClick={() =>
															setPeerProfiles((profiles) =>
																profiles.map((p) => {
																	if (p.name === profile.name) {
																		return {
																			...p,
																			name: profile.name,
																			description: profile.description,
																			selected: !profile.selected,
																		};
																	}
																	return p;
																}),
															)
														}
														onMouseOver={() => {
															setTempName(profile.name);
															setTempDescription(profile.description);
														}}
													>
														{profile.selected && <HiCheck />}
														{profile.name}
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
																		setPeerProfiles((profiles) => {
																			return profiles.map((p) => {
																				if (p.name === profile.name) {
																					return {
																						...p,
																						name: tempName,
																						description: tempDescription,
																						selected: true,
																					};
																				}
																				return p;
																			});
																		});
																	}}
																>
																	Save and Add
																</Button>
																<Button
																	variant="destructive"
																	onClick={() => {
																		setPeerProfiles(() =>
																			peerProfiles.filter(
																				(item) => item.name !== profile.name,
																			),
																		);
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
																setPeerProfiles((profiles) => [
																	...profiles,
																	{
																		name: formName,
																		description: formDescription,
																		selected: true,
																	},
																]);
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
					<Button onClick={() => {
						startBrainstorming(props)
					}} className="w-full">
						<HiOutlineBolt /> <span>Start Brainstorming</span>
					</Button>
				</CardFooter>
				<Handle type="target" position={Position.Top} />
				<Handle type="source" position={Position.Top} />
			</Card>

		</>
	);
}
