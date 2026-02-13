import { dev } from '$app/environment';

export const SITE = 'https://atlas.atmo.pics';

export const MAIN_COLLECTION = dev ? 'pics.atmo.atlas.dev' : 'pics.atmo.atlas.v0';
export const VOTE_COLLECTION = dev ? 'votes.atmo.atlas.dev' : 'votes.atmo.atlas.v0';

type Permissions = {
	collections: readonly string[];
	rpc: Record<string, string | string[]>;
	blobs: readonly string[];
};

export const permissions = {
	// collections you can create/delete/update

	// example: only allow create and delete
	// collections: ['xyz.statusphere.status?action=create&action=update'],
	collections: [MAIN_COLLECTION, VOTE_COLLECTION],

	// what types of authenticated proxied requests you can make to services

	// example: allow authenticated proxying to bsky appview to get a users liked posts
	//rpc: {'did:web:api.bsky.app#bsky_appview': ['app.bsky.feed.getActorLikes']}
	rpc: {},

	// what types of blobs you can upload to a users PDS

	// example: allowing video and html uploads
	// blobs: ['video/*', 'text/html']
	// example: allowing all blob types
	// blobs: ['*/*']
	blobs: ['image/*']
} as const satisfies Permissions;

// Extract base collection name (before any query params)
type ExtractCollectionBase<T extends string> = T extends `${infer Base}?${string}` ? Base : T;

export type AllowedCollection = ExtractCollectionBase<(typeof permissions.collections)[number]>;

// which PDS to use for signup
// ATTENTION: pds.rip is only for development, all accounts get deleted automatically after a week
const devPDS = 'https://pds.rip/';
const prodPDS = 'https://selfhosted.social/';
export const signUpPDS = dev ? devPDS : prodPDS;

// where to redirect after oauth login/signup, e.g. /oauth/callback
export const REDIRECT_PATH = '/';

export const DOH_RESOLVER = 'https://mozilla.cloudflare-dns.com/dns-query';
