import { useEffect, useLayoutEffect, useRef } from "react";
import { BsRobot } from "react-icons/bs";
import { Handle, type NodeProps, Position } from "reactflow";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";

export type AIGeneratedNodeData = {
	label:
	| "AI Section Suggestion"
	| "AI Question"
	| "AI Stimulating Question"
	| "Domain Expert Opinion";
	content: string;
	helperText?: string;
};

export default function AIGeneratedNode({
	id,
	data,
}: NodeProps<AIGeneratedNodeData>) {
	const inputRef = useRef<HTMLInputElement>(null);
	// const updateNodeLabel = useStore((state) => state.updateNodeLabel);
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

	switch (data.label) {
		case "AI Section Suggestion":
			return (
				<Popover>
					<PopoverTrigger asChild className="text-left">
						<div className="relative w-[200px] bg-white p-4 rounded-3xl shadow-md border-2 border-black dragHandle">
							<Handle type="target" position={Position.Left} />
							<div className="flex items-center gap-x-2 text-xs">
								<BsRobot />
								<span className="italic">{data.label}</span>
							</div>
							<span>{data.content}</span>
							<Handle type="source" position={Position.Right} />
						</div>
					</PopoverTrigger>
					<PopoverContent
						className="flex flex-col bg-gray-100 p-4"
						align="start"
						side="top"
					>
						<div className="flex items-center gap-x-2 gap-y-3">
							<BsRobot />
							<span className="text-xs italic">What's this?</span>
						</div>
						<span>{data.helperText}</span>
					</PopoverContent>
				</Popover>
			);
		case "AI Question":
			return (
				<div className="relative w-[200px] bg-white p-4 shadow-md border-2 border-dotted border-black dragHandle">
					<Handle type="target" position={Position.Left} />
					<div className="flex items-center gap-x-2 text-xs">
						<BsRobot />
						<span className="italic">{data.label}</span>
					</div>
					<span>{data.content}</span>
					<Handle type="source" position={Position.Right} />
				</div>

			);
	}
	return (
		<div className="relative bg-white p-2 rounded-lg shadow-md border-2 border-black">
			<Handle type="target" position={Position.Top} />
			<input
				ref={inputRef}
				className="text-center"
				value={data.label}
				onChange={(e) => {
					// updateNodeLabel(id, e.target.value);
				}}
			/>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}
