import { useEffect, useLayoutEffect, useRef } from "react";
import { BsRobot } from "react-icons/bs";
import {
	HiDocument,
	HiLightBulb,
	HiOutlineChatBubbleBottomCenterText,
	HiOutlineLightBulb,
} from "react-icons/hi2";
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
						<div className="relative w-[250px] bg-white p-4 rounded-3xl shadow-md border-2 border-black dragHandle">
							<Handle type="target" position={Position.Left} style={{height: "12px",  width: "12px"}} className="w-16" />
							<div className="flex items-center gap-x-2 text-xs">
								<BsRobot />
								<span className="italic">{data.label}</span>
							</div>
							<span>{data.helperText}</span>
							<Handle type="source" position={Position.Right} style={{height: "12px",  width: "12px"}} className="w-16" />
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
						<span>{data.content}</span>
					</PopoverContent>
				</Popover>
			);
		case "AI Question":
			return (
				<div className="relative w-[250px] bg-white p-4 shadow-md border-2 border-dotted border-black dragHandle">
					<Handle type="target" position={Position.Left} style={{height: "12px",  width: "12px"}} className="w-16" />
					<div className="flex items-center gap-x-2 text-xs">
						<BsRobot />
						<span className="italic">{data.label}</span>
					</div>
					<span>{data.content}</span>
					<Handle type="source" position={Position.Right} style={{height: "12px",  width: "12px"}} className="w-16" />
				</div>
			);
		case "Domain Expert Opinion":
			return (
				<div className="relative w-[400px] bg-black p-4 shadow-md border-2 border-dotted border-white text-white dragHandle">
					<Handle type="target" position={Position.Left} style={{height: "12px",  width: "12px"}} className="w-16"/>
					<div className="flex items-center justify-between gap-x-2">
						<BsRobot />
						<span className="italic text-xs">{data.label}</span>
						<HiOutlineChatBubbleBottomCenterText />
					</div>
					<span>{data.content}</span>
					<Handle type="source" position={Position.Right} style={{height: "12px",  width: "12px"}} className="w-16"/>
				</div>
			);
		case "AI Stimulating Question":
			return (
				<div className="relative w-[400px] bg-[#FFE2C0] p-4 shadow-md border-2 border-dotted border-black dragHandle">
					<Handle type="target" position={Position.Left} style={{height: "12px",  width: "12px"}} className="w-16"/>
					<div className="flex items-center justify-between gap-x-2">
						<BsRobot />
						<span className="italic text-xs">{data.label}</span>
						<HiOutlineLightBulb />
					</div>
					<span>{data.content}</span>
					<Handle type="source" position={Position.Right} style={{height: "12px",  width: "12px"}} className="w-16"/>
				</div>
			);
	}
}
