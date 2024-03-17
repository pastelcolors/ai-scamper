import { useEffect, useLayoutEffect, useRef } from "react";
import { Handle, type NodeProps, Position } from "reactflow";

import useStore from "../../lib/store";
import { HiUser } from "react-icons/hi2";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { BsRobot } from "react-icons/bs";
import { Button } from "../ui/button";

export type UserNodeData = {
	label: string;
};

export default function UserNode({ id, data }: NodeProps<UserNodeData>) {
	const inputRef = useRef<HTMLInputElement>(null);
	const updateNodeData = useStore((state) => state.updateNodeData);

	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus({ preventScroll: true });
		}, 1);
	}, []);

	useLayoutEffect(() => {
		if (inputRef.current) {
			inputRef.current.style.width = `${data.label.length * 8}px`;
		}
	}, [data.label.length]);

	return (
		<Popover>
			<PopoverTrigger>
				<div className="relative w-[200px] bg-white p-4 rounded-md shadow-md border-2 border-black dragHandle">
					<Handle type="target" position={Position.Left} />
					<div className="flex items-center gap-x-2 text-xs">
						<HiUser />
						<span className="italic">Your Idea</span>
					</div>
					<input
						value={data.label}
						onChange={(evt) => updateNodeData(id, { label: evt.target.value })}
						className="input"
						ref={inputRef}
					/>
					<Handle type="source" position={Position.Right} />
				</div>
			</PopoverTrigger>
			<PopoverContent
				className="flex flex-col bg-gray-100 p-4"
				align="start"
			>
				<div className="flex flex-col w-full space-y-3">
					<Button variant="ghost" className="bg-[#FFE2C0] hover:bg-[#fde6cc] text-black flex space-x-1 items-center">
						<div className="w-6 h-6 flex justify-center items-center flex-col">
							<BsRobot />
						</div>
						<span>Generate Stimulating Questions</span>
					</Button>
					<Button className=" flex space-x-1 items-center">
						<BsRobot />
						<span>Generate Peer/s Opinion</span>
					</Button>
				</div>
			</PopoverContent>

		</Popover>
	);
}
