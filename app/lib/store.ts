import { nanoid } from "nanoid/non-secure";
import {
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  type OnEdgesChange,
  type OnNodesChange,
  type XYPosition,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import { createWithEqualityFn } from "zustand/traditional";

import type { AIGeneratedNodeData } from "~/components/Flow/AIGeneratedNode";
import type { UserNodeData } from "~/components/Flow/UserNode";
import type { MasterNodeData } from "../components/Flow/MasterNode";
import { Tree } from "~/schemas/schemas";

type NodeData = MasterNodeData | UserNodeData | AIGeneratedNodeData;

export type RFState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  updateNodeData: (nodeId: string, data: NodeData) => void;
  addChildNode: (parentNode: Node, position: XYPosition) => void;
  startBrainstorming: (parentNode: NodeProps<MasterNodeData>) => void;
  isLoading: boolean;
};

function generateNodesAndEdges(data: Tree["root"], parentId: string, xPos = 0, yPos = 0): [Node<AIGeneratedNodeData>[], Edge[]] {
  let nodes: Node<AIGeneratedNodeData>[] = [];
  let edges: Edge[] = [];
  const yOffset = 200; // Vertical offset between nodes

  data.forEach((node, index) => {
    const nodeId = node.id;
    const rfNode: Node<AIGeneratedNodeData> = {
      id: nodeId,
      type: "AIGeneratedNode",
      data: { label: node.label, content: node.content, helperText: node.helper },
      position: { x: xPos, y: yPos + index * yOffset },
      dragHandle: ".dragHandle",
      parentNode: parentId,
    };
    nodes.push(rfNode);

    if (parentId) {
      const edge: Edge = {
        id: nanoid(),
        source: parentId,
        target: nodeId,
      };
      edges.push(edge);
    }

    if (node.children && node.children.length > 0) {
      const [childNodes, childEdges] = generateNodesAndEdges(node.children, nodeId, xPos + 1000, yPos + 700);
      nodes = [...nodes, ...childNodes];
      edges = [...edges, ...childEdges];
    }
  });

  return [nodes, edges];
}


const useStore = createWithEqualityFn<RFState>((set, get) => ({
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
  addChildNode: (parentNode: Node, position: XYPosition) => {
    const newNode = {
      id: nanoid(),
      type: "UserNode",
      data: { label: "Input details about X" },
      position,
      dragHandle: ".dragHandle",
      parentNode: parentNode.id,
    };

    const newEdge = {
      id: nanoid(),
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
    const response = await fetch('/api', {
      method: 'POST',
      body: JSON.stringify({ ...parentNodeData.data, projectId: '123' }),
    });
    const json: { data: Tree } = await response.json();
    const parentId = parentNodeData.id;

    const [aiGeneratedNodes, newEdges] = generateNodesAndEdges(json.data.root, parentId);

    set({
      nodes: [...get().nodes, ...aiGeneratedNodes],
      edges: [...get().edges, ...newEdges],
    });
    set({ isLoading: false });
  },
  isLoading: false,
}));

export default useStore;
