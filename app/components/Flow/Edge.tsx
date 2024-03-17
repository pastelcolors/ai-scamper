import { BaseEdge, type EdgeProps, getStraightPath } from "reactflow";

export default function EdgeComponent(props: EdgeProps) {
	const { sourceX, sourceY, targetX, targetY } = props;

	const [edgePath] = getStraightPath({
		sourceX,
		sourceY: sourceY + 18,
		targetX,
		targetY,
	});

	return <BaseEdge path={edgePath} {...props} />;
}
