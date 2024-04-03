import type { MetaFunction } from "@remix-run/node";

import Flow from "../components/Flow";

import { ReactFlowProvider } from "reactflow";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Brainstorming Tool" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-[40px] flex items-center border border-[#eee] px-4">📖 AI Brainstorming Tool</header>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
