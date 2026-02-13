import type { VOTE_COLLECTION } from '$lib/atproto/settings';

export type VoteType = 'up' | 'down' | 'save';

export type VoteRecord = {
	$type: typeof VOTE_COLLECTION;
	subject: string;
	vote: VoteType;
	createdAt: string;
};

export type VoteCardData = {
	uri: string;
	did: string;
	rkey: string;
	name: string;
	imageUrl: string;
	lat?: number;
	lon?: number;
};
