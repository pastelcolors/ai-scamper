import { UseQueryResult, useQuery } from "react-query";

interface MetaFetchProviderProps<T, F = T | null, Q = UseQueryResult<F>> {
	children: React.ReactNode;
	query: [key: string, () => Promise<F>];
	context: React.Context<Q | undefined>;
	loader: React.ReactNode;
}

export function MetaFetchProvider<T>(props: MetaFetchProviderProps<T>) {
	const query = useQuery<T>(props.query);

	if (query.isFetching) {
		return props.loader;
	}

	return (
		<props.context.Provider value={query}>
			{props.children}
		</props.context.Provider>
	);
}
