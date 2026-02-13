const COLLECTION = 'pics.atmo.atlas.v0';

const recentRecordsURL = `https://jetstream-worker.flobit-dev.workers.dev/records/${COLLECTION}?limit=100`;

function getImageUrl(record: Record<string, any>, did: string): string | undefined {
	const blob = record?.images?.[0]?.image;
	if (typeof blob === 'object' && blob?.$type === 'blob') {
		return `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${blob.ref.$link}@webp`;
	}
}

function getName(record: Record<string, any>): string {
	return record?.name ?? record?.location?.name ?? 'Unknown POI';
}

export async function load({ fetch }) {
	const response = await fetch(recentRecordsURL);
	const data = await response.json();
	const records = data.records ?? [];

	const cards = records
		.map((entry: any) => {
			const imageUrl = getImageUrl(entry.record, entry.did);
			if (!imageUrl) return null;
			return {
				uri: entry.uri,
				did: entry.did,
				rkey: entry.rkey ?? entry.uri?.split('/').pop() ?? '',
				name: getName(entry.record),
				imageUrl,
				lat: entry.record?.location?.lat,
				lon: entry.record?.location?.lon
			};
		})
		.filter(Boolean);

	return { cards };
}
