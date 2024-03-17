/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useRef } from "react";
import ReactFlow, {
	ConnectionLineType,
	type NodeOrigin,
	type Node,
	type OnConnectEnd,
	type OnConnectStart,
	useReactFlow,
	useStoreApi,
	Controls,
	MiniMap,
	Background,
	BackgroundVariant,
} from "reactflow";
import { shallow } from "zustand/shallow";

import useStore, { type RFState } from "../../lib/store";
import EdgeComponent from "./Edge";
import UserNode from "./UserNode";

// we need to import the React Flow styles to make it work
import "reactflow/dist/style.css";
import Scamper from "../Scamper";
import AIGeneratedNode from "./AIGeneratedNode";
import MasterNode from "./MasterNode";
import Loader from "../Loader";

const selector = (state: RFState) => ({
	nodes: state.nodes,
	edges: state.edges,
	onNodesChange: state.onNodesChange,
	onEdgesChange: state.onEdgesChange,
	addChildNode: state.addChildNode,
	isLoading: state.isLoading,
});

const nodeTypes = {
	UserNode: UserNode,
	AIGeneratedNode: AIGeneratedNode,
	MasterNode: MasterNode,
};

const edgeTypes = {
	mindmap: EdgeComponent,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const connectionLineStyle = { stroke: "#000", strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: "mindmap" };

function Flow() {
	const store = useStoreApi();
	const { nodes, edges, onNodesChange, onEdgesChange, addChildNode, isLoading } = useStore(
		selector,
		shallow,
	);
	const { screenToFlowPosition } = useReactFlow();
	const connectingNodeId = useRef<string | null>(null);

	const getChildNodePosition = (
		event: MouseEvent | TouchEvent,
		parentNode?: Node,
	) => {
		const { domNode } = store.getState();

		if (
			!domNode ||
			!parentNode?.positionAbsolute ||
			!parentNode?.width ||
			!parentNode?.height
		) {
			return;
		}

		const { top, left } = domNode.getBoundingClientRect();

		const panePosition = screenToFlowPosition({
			x: ("touches" in event ? event.touches[0].clientX : event.clientX) - left,
			y: ("touches" in event ? event.touches[0].clientY : event.clientY) - top,
		});

		return {
			x: panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
			y: panePosition.y - parentNode.positionAbsolute.y + parentNode.height / 2,
		};
	};

	const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
		connectingNodeId.current = nodeId;
	}, []);

	const onConnectEnd: OnConnectEnd = useCallback(
		(event) => {
			const { nodeInternals } = store.getState();
			const targetIsPane = (event.target as Element).classList.contains(
				"react-flow__pane",
			);
			const node = (event.target as Element).closest(".react-flow__node");

			if (node) {
				node.querySelector("input")?.focus({ preventScroll: true });
			} else if (targetIsPane && connectingNodeId.current) {
				const parentNode = nodeInternals.get(connectingNodeId.current);
				const childNodePosition = getChildNodePosition(event, parentNode);

				if (
					parentNode &&
					childNodePosition &&
					parentNode.type !== "MasterNode"
				) {
					addChildNode(parentNode, childNodePosition);
				}
			}
		},
		[addChildNode, getChildNodePosition, store],
	);

	return (

		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnectStart={onConnectStart}
			onConnectEnd={onConnectEnd}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			nodeOrigin={nodeOrigin}
			defaultEdgeOptions={defaultEdgeOptions}
			connectionLineStyle={connectionLineStyle}
			connectionLineType={ConnectionLineType.Straight}
			proOptions={{
				hideAttribution: true,
			}}
			fitView
		>
			<Loader isLoading={isLoading} />
			<div className="absolute bottom-0 left-0">
				<Controls showInteractive={false} />
				<Scamper />
			</div>
			<Background variant={BackgroundVariant.Dots} />
			<MiniMap />
		</ReactFlow>
	);
}

export default Flow;
