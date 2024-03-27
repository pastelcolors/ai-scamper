import { nanoid } from "nanoid/non-secure";
import {
	type Edge,
	type EdgeChange,
	type Node,
	type NodeChange,
	type NodeProps,
	type OnEdgesChange,
	type OnNodesChange,
	type ReactFlowJsonObject,
	type XYPosition,
	applyEdgeChanges,
	applyNodeChanges,
	useReactFlow,
} from "reactflow";
import { createWithEqualityFn } from "zustand/traditional";

import type { AIGeneratedNodeData } from "~/components/Flow/AIGeneratedNode";
import type { UserNodeData } from "~/components/Flow/UserNode";
import { convertReactFlowToMermaid } from "~/components/Scamper";
import type { MasterNodeData } from "../components/Flow/MasterNode";
import type { DomainExpertResponse, Role } from "~/schemas/schemas";

type NodeData = MasterNodeData | UserNodeData | AIGeneratedNodeData;

export type RFState = {
	nodes: Node<NodeData>[];
	edges: Edge[];
	onNodesChange: OnNodesChange;
	onEdgesChange: OnEdgesChange;
	updateNodeData: (nodeId: string, data: NodeData) => void;
	addChildNode: (parentNode: Node, position: XYPosition) => void;
	startBrainstorming: (parentNode: NodeProps<MasterNodeData>) => void;
	domainExpertOpinion: (
		parentNode: NodeProps<UserNodeData>,
		graphObject: ReactFlowJsonObject,
	) => void;
	isLoading: boolean;
	agents: Agent[];
	updateAgents: (role: Agent) => void;
	updateAgent: (role: Agent) => void;
	addAgent: (role: Agent) => void;
	setNodes: (nodes: Node<NodeData>[]) => void;
	setEdges: (edges: Edge[]) => void;
	stimulatingQuestion: (
		parentNode: NodeProps<UserNodeData>,
		graphObject: ReactFlowJsonObject,
	) => void;
};

type AISection = {
	source: string;
	nodeId: string;
	label:
		| "AI Section Suggestion"
		| "AI Question"
		| "AI Stimulating Question"
		| "Domain Expert Opinion";
	content: string;
	helper?: string;
	childrenNodes: AISection[];
};

interface Agent extends Role {
	selected: boolean;
}

function generateRootNodesAndEdges(
	data: any[],
	parentId: string | null = null,
	xPos = 0,
	yPos = 0,
) {
	let nodes: Node<AIGeneratedNodeData>[] = [];
	let edges: Edge[] = [];
	const yOffset = 200;

	data.forEach((section, index) => {
		const nodeId = nanoid();
		const node: Node<AIGeneratedNodeData> = {
			id: nodeId,
			type: "AIGeneratedNode",
			data: {
				label: section.label,
				content: section.content,
				helperText: section.helper,
			},
			position: { x: xPos, y: yPos + index * yOffset },
			dragHandle: ".dragHandle",
			parentNode: parentId,
		};
		nodes.push(node);

		if (parentId) {
			const edge: Edge = {
				id: nanoid(5),
				source: parentId,
				target: nodeId,
			};
			edges.push(edge);
		}

		if (section.children && section.children.length > 0) {
			const [childNodes, childEdges] = generateRootNodesAndEdges(
				section.children,
				nodeId,
				xPos + 1000,
				yPos + 700,
			);
			nodes = nodes.concat(childNodes);
			edges = edges.concat(childEdges);
		}
	});

	return [nodes, edges];
}

function generatePeerNodes(
	data: any[],
	label: "Domain Expert Opinion" | "AI Stimulating Question",
	parentId: string,
	xPos = 0,
	yPos = 0,
) {
	const nodes: Node<AIGeneratedNodeData>[] = [];
	const edges: Edge[] = [];
	const yOffset = 200;
	for (const element of data) {
		const nodeId = nanoid(5);
		const node: Node<AIGeneratedNodeData> = {
			id: nodeId,
			type: "AIGeneratedNode",
			data: {
				label,
				content: element.thoughts,
			},
			position: { x: xPos, y: yPos },
			dragHandle: ".dragHandle",
			parentNode: parentId,
		};
		nodes.push(node);
		const edge: Edge = {
			id: nanoid(5),
			source: parentId,
			target: nodeId,
		};
		edges.push(edge);
	}
	return [nodes, edges];
}

const useStore = createWithEqualityFn<RFState>((set, get) => ({
	setNodes: (nodes: Node<NodeData>[]) => {
		set({ nodes });
	},
	setEdges: (edges: Edge[]) => {
		set({ edges });
	},
	nodes: [
		{
			id: "root",
			type: "MasterNode",
			data: {
				problem: "",
				goal: "",
			},
			isConnectable: false,
			draggable: false,
			position: { x: 0, y: 0 },
			dragHandle: ".dragHandle",
		},
	],
	edges: [],
	onNodesChange: (changes: NodeChange[]) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},
	onEdgesChange: (changes: EdgeChange[]) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},
	updateNodeData: (nodeId: string, data: NodeData) => {
		set({
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					node.data = data;
				}
				return node;
			}),
		});
	},
	agents: [
		{
			role: "🏢 CEO",
			description: "The CEO of a large company",
			selected: false,
		},
		{
			role: "📈 Marketing Manager",
			description: "The marketing manager of a large company",
			selected: false,
		},
	],
	updateAgents: (role: Agent) => {
		set({
			agents: get().agents.map((agent) => {
				if (agent.role === role.role) {
					return role;
				}
				return agent;
			}),
		});
	},
	updateAgent: (role: Agent) => {
		set({
			agents: get().agents.map((agent) => {
				if (agent.role === role.role) {
					return role;
				}
				return agent;
			}),
		});
	},
	addAgent: (role: Agent) => {
		set({
			agents: [...get().agents, role],
		});
	},
	addChildNode: (parentNode: Node, position: XYPosition) => {
		const newNode = {
			id: nanoid(5),
			type: "UserNode",
			data: { label: "" },
			position,
			dragHandle: ".dragHandle",
			parentNode: parentNode.id,
		};

		const newEdge = {
			id: nanoid(5),
			source: parentNode.id,
			target: newNode.id,
		};

		set({
			nodes: [...get().nodes, newNode],
			edges: [...get().edges, newEdge],
		});
	},
	startBrainstorming: async (parentNodeData: NodeProps<MasterNodeData>) => {
		set({ isLoading: true });
		const response = await fetch("/api", {
			method: "POST",
			body: JSON.stringify({ ...parentNodeData.data, projectId: "123" }),
		});
		const json = await response.json();
		const parentId = parentNodeData.id;

		const [aiGeneratedNodes, newEdges] = generateRootNodesAndEdges(
			json.root,
			parentId,
		);

		set({
			nodes: [...get().nodes, ...aiGeneratedNodes],
			edges: [...get().edges, ...newEdges],
		});
		set({ isLoading: false });
	},
	domainExpertOpinion: async (
		parentNodeData: NodeProps<UserNodeData>,
		graphObject: ReactFlowJsonObject,
	) => {
		set({ isLoading: true });
		const graph = convertReactFlowToMermaid(graphObject);
		const response = await fetch("/api/domain-expert-opinion", {
			method: "POST",
			body: JSON.stringify({
				answer: parentNodeData.data.label,
				answerNodeId: parentNodeData.id,
				projectId: "123",
				graph,
				roles: get().agents.filter((agent) => agent.selected),
			}),
		});
		const json = await response.json();
		const parentId = parentNodeData.id;

		const [aiGeneratedNodes, newEdges] = generatePeerNodes(
			json.opinion,
			"Domain Expert Opinion",
			parentId,
		);

		set({
			nodes: [...get().nodes, ...aiGeneratedNodes],
			edges: [...get().edges, ...newEdges],
		});
		set({ isLoading: false });
	},
	stimulatingQuestion: async (
		parentNodeData: NodeProps<UserNodeData>,
		graphObject: ReactFlowJsonObject,
	) => {
		set({ isLoading: true });
		const graph = convertReactFlowToMermaid(graphObject);
		const response = await fetch("/api/stimulating-question", {
			method: "POST",
			body: JSON.stringify({
				answer: parentNodeData.data.label,
				answerNodeId: parentNodeData.id,
				projectId: "123",
				graph,
				roles: get().agents.filter((agent) => agent.selected),
			}),
		});
		const json = await response.json();
		const parentId = parentNodeData.id;

		const [aiGeneratedNodes, newEdges] = generatePeerNodes(
			json.question,
			"AI Stimulating Question",
			parentId,
		);

		set({
			nodes: [...get().nodes, ...aiGeneratedNodes],
			edges: [...get().edges, ...newEdges],
		});
		set({ isLoading: false });
	},

	isLoading: false,
}));

export default useStore;
