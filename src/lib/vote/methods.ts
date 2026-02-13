import { putRecord, deleteRecord, listRecords, parseUri } from '$lib/atproto/methods';
import { VOTE_COLLECTION } from '$lib/atproto/settings';
import type { VoteRecord } from './types';

function getSubjectRkey(subjectUri: string): string {
	const parsed = parseUri(subjectUri);
	if (!parsed?.rkey) throw new Error('Invalid AT URI: ' + subjectUri);
	return parsed.rkey;
}

export async function castVote(subjectUri: string, vote: 'up' | 'down') {
	const rkey = `vote-${getSubjectRkey(subjectUri)}`;
	return putRecord({
		collection: VOTE_COLLECTION,
		rkey,
		record: {
			$type: VOTE_COLLECTION,
			subject: subjectUri,
			vote,
			createdAt: new Date().toISOString()
		}
	});
}

export async function savePoi(subjectUri: string) {
	const saveRkey = `save-${getSubjectRkey(subjectUri)}`;
	const savePromise = putRecord({
		collection: VOTE_COLLECTION,
		rkey: saveRkey,
		record: {
			$type: VOTE_COLLECTION,
			subject: subjectUri,
			vote: 'save',
			createdAt: new Date().toISOString()
		}
	});
	const upvotePromise = castVote(subjectUri, 'up');
	return Promise.all([savePromise, upvotePromise]);
}

export async function unsavePoi(subjectUri: string) {
	const rkey = `save-${getSubjectRkey(subjectUri)}`;
	return deleteRecord({ collection: VOTE_COLLECTION, rkey });
}

export async function removeVote(subjectUri: string) {
	const rkey = `vote-${getSubjectRkey(subjectUri)}`;
	return deleteRecord({ collection: VOTE_COLLECTION, rkey });
}

export async function getUserVotes(): Promise<Map<string, VoteRecord>> {
	const records = await listRecords({ collection: VOTE_COLLECTION, limit: 0 });
	const votes = new Map<string, VoteRecord>();

	for (const record of records) {
		const value = record.value as VoteRecord;
		const prefix = value.vote === 'save' ? 'save' : 'vote';
		votes.set(`${prefix}:${value.subject}`, value);
	}

	return votes;
}
