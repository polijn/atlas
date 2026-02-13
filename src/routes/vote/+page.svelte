<script lang="ts">
	import { user } from '$lib/atproto';
	import { loginModalState } from '$lib/atproto/UI/LoginModal.svelte';
	import CardSwiper from '$lib/components/CardSwiper/CardSwiper.svelte';
	import type {
		CardData,
		Direction,
		SwipeEventData,
		SwiperControls
	} from '$lib/components/CardSwiper';
	import { castVote, savePoi, getUserVotes } from '$lib/vote';
	import type { VoteCardData } from '$lib/vote';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let { data } = $props();

	let deck = $state<VoteCardData[]>([]);
	let loading = $state(true);
	let thresholdPassed = $state<Direction | null>(null);
	let controls = $state<SwiperControls>({ swipe: () => {} });
	let currentIndex = $state(0);
	let finished = $state(false);

	onMount(async () => {
		if (!user.isLoggedIn) {
			deck = data.cards;
			loading = false;
			return;
		}

		try {
			const votes = await getUserVotes();
			const votedUris = new SvelteSet<string>();
			for (const [key] of votes) {
				const uri = key.replace(/^(vote|save):/, '');
				votedUris.add(uri);
			}

			deck = data.cards.filter((card: VoteCardData) => !votedUris.has(card.uri));
		} catch (e) {
			console.error('Failed to load votes:', e);
			deck = data.cards;
		}

		loading = false;
	});

	function getCardData(index: number): CardData {
		if (index >= deck.length) {
			return {};
		}
		const card = deck[index];
		return {
			title: card.name,
			image: card.imageUrl,
			uri: card.uri,
			did: card.did,
			rkey: card.rkey
		};
	}

	function handleSwipe(event: SwipeEventData) {
		const cardUri = event.data.uri as string | undefined;
		if (!cardUri || !user.isLoggedIn) return;

		currentIndex = event.index + 1;
		if (currentIndex >= deck.length - 1) {
			finished = true;
		}

		if (event.direction === 'right') {
			castVote(cardUri, 'up').catch((e) => console.error('Vote failed:', e));
		} else if (event.direction === 'left') {
			castVote(cardUri, 'down').catch((e) => console.error('Vote failed:', e));
		} else if (event.direction === 'up') {
			savePoi(cardUri).catch((e) => console.error('Save failed:', e));
		}
	}

	const directionIcon: Record<Direction, string> = {
		right: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/></svg>',
		left: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/><path d="M17 14V2"/></svg>',
		up: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/><path d="m9 10 2 2 4-4"/></svg>',
		down: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 18 6-6-6-6"/><path d="M17 6v12"/></svg>'
	};
</script>

		{#if user.isInitializing || loading}
			<div class="flex flex-1 items-center justify-center">
				<p class="text-base-600 dark:text-base-400 text-lg">Loading...</p>
			</div>
		{:else if !user.isLoggedIn}
			<div class="flex flex-1 flex-col items-center justify-center gap-4">
				<p class="text-base-600 dark:text-base-300 text-center text-lg">Sign in to vote on POIs</p>
				<button
					type="button"
					class="bg-accent-600 hover:bg-accent-500 cursor-pointer rounded-full px-8 py-3 text-lg font-bold text-white shadow-lg transition-all active:scale-95"
					onclick={() => loginModalState.show()}
				>
					Sign in
				</button>
			</div>
		{:else if deck.length === 0}
			<div class="flex flex-1 flex-col items-center justify-center gap-4">
				<p class="text-base-600 dark:text-base-300 text-center text-lg">No more POIs to vote on</p>
				<a
					href="/"
					class="bg-accent-600 hover:bg-accent-500 rounded-full px-8 py-3 text-lg font-bold text-white shadow-lg transition-all active:scale-95"
				>
					Go home
				</a>
			</div>
		{:else}
		<div class="h-screen w-screen overflow-x-hidden">
					<!-- bind:controls -->
					<CardSwiper
						cardData={getCardData}
						onSwipe={handleSwipe}
						bind:thresholdPassed
					/>

</div>
					<div class="absolute bottom-4 left-1/2 z-10 grid -translate-x-1/2 grid-cols-3 grid-rows-3 place-items-center gap-1">
					<div class="col-start-2 row-start-1">
						<button
							class="cursor-pointer rounded-full bg-accent-600/50 p-3 px-4 text-3xl backdrop-blur-sm transition-transform active:scale-90"
							onclick={() => controls.swipe('up')}
							aria-label="Save"
						>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark-check-icon lucide-bookmark-check"><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/><path d="m9 10 2 2 4-4"/></svg>
						</button>
					</div>
					<div class="col-start-1 row-start-2">
						<button
							class="cursor-pointer rounded-full bg-accent-600/50 p-3 px-4 text-3xl backdrop-blur-sm transition-transform active:scale-90"
							onclick={() => controls.swipe('left')}
							aria-label="Downvote"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thumbs-down-icon lucide-thumbs-down"><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/><path d="M17 14V2"/></svg>
						</button>
					</div>
					<div class="col-start-3 row-start-2">
						<button
							class="cursor-pointer rounded-full bg-accent-600/50 p-3 px-4 text-3xl backdrop-blur-sm transition-transform active:scale-90"
							onclick={() => controls.swipe('right')}
							aria-label="Upvote"
						>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thumbs-up-icon lucide-thumbs-up"><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/></svg>
						</button>
					</div>
					<div class="col-start-2 row-start-3">
						<button
							class="cursor-pointer rounded-full bg-accent-600/50 p-3 px-4 text-3xl backdrop-blur-sm transition-transform active:scale-90"
							onclick={() => controls.swipe('down')}
							aria-label="Skip"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-last-icon lucide-chevron-last"><path d="m7 18 6-6-6-6"/><path d="M17 6v12"/></svg>
						</button>
					</div>
				</div>

				{#if thresholdPassed}
					<div
						class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
					>
						{@html directionIcon[thresholdPassed]}
					</div>
				{/if}

				{#if finished}
					<div
						class="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm dark:bg-black/80"
					>
						<p class="text-base-600 dark:text-base-300 text-center text-lg">
							No more POIs to vote on
						</p>
						<a
							href="/"
							class="bg-accent-600 hover:bg-accent-500 rounded-full px-6 py-2 font-bold text-white shadow-lg transition-all active:scale-95"
						>
							Go home
						</a>
					</div>
				{/if}
		{/if}

