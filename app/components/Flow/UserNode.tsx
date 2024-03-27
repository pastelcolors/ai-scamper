import { Handle, type NodeProps, Position, useReactFlow } from "reactflow";

import useStore from "../../lib/store";
import { HiUser } from "react-icons/hi2";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { BsRobot } from "react-icons/bs";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export type UserNodeData = {
	label: string;
};

export default function UserNode(props: NodeProps<UserNodeData>) {
	const updateNodeData = useStore((state) => state.updateNodeData);
	const generateOpinion = useStore((state) => state.domainExpertOpinion);
	const generateQuestion = useStore((state) => state.stimulatingQuestion);
	const reactFlow = useReactFlow();

	return (
		<Popover>
			<div className="relative">
				<Textarea
					value={props.data.label}
					onChange={(e) => updateNodeData(props.id, { label: e.target.value })}
					className="input absolute z-10 overflow-hidden text-ellipsis w-[180px] bottom-3 mt-2 inset-x-0 mx-auto"
					placeholder="Your Idea"
					rows={1}
				/>
				<PopoverTrigger>
					<div className="relative w-[250px] bg-white p-4 rounded-md shadow-md border-2 border-black dragHandle">
						<Handle type="target" position={Position.Left} />
						<div className="flex items-center gap-x-2 text-xs pb-20">
							<HiUser />
							<span className="italic">Your Idea</span>
						</div>

						<Handle type="source" position={Position.Right} />
					</div>
				</PopoverTrigger>
			</div>
			<PopoverContent className="flex flex-col bg-gray-100 p-4" align="start">
				<div className="flex flex-col w-full space-y-3">
					<Button
						variant="ghost"
						onClick={() => generateQuestion(props, reactFlow.toObject())}
						className="bg-[#FFE2C0] hover:bg-[#fde6cc] text-black flex space-x-1 items-center"
					>
						<div className="w-6 h-6 flex justify-center items-center flex-col">
							<BsRobot />
						</div>
						<span>Generate Stimulating Questions</span>
					</Button>
					<Button
						onClick={() => generateOpinion(props, reactFlow.toObject())}
						className=" flex space-x-1 items-center"
					>
						<div className="w-6 h-6 flex justify-center items-center flex-col">
							<BsRobot />
						</div>
						<span>Domain Expert Opinion</span>
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

