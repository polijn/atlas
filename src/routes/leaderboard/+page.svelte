<script lang="ts">
	import Avatar from '$lib/atproto/UI/Avatar.svelte';

	let { data } = $props();
</script>

<div class="bg-base-50 dark:bg-base-950 flex min-h-dvh flex-col items-center px-6 py-16">
	<div class="w-full max-w-lg">
		<h1 class="text-base-900 dark:text-base-50 text-2xl font-bold">Leaderboard</h1>
		<p class="text-base-500 dark:text-base-400 mt-1 text-sm">Top uploaders by image count</p>

		<ol class="mt-8 space-y-2">
			{#each data.leaderboard as entry, i (entry.did)}
				{@const rank = i + 1}
				<li>
					<a
						href="/map/{entry.profile?.handle ?? entry.did}"
						class="bg-base-100 hover:bg-base-200 dark:bg-base-900 dark:hover:bg-base-800 flex items-center gap-4 rounded-xl px-4 py-3 transition-colors"
					>
						<span
							class="text-base-400 dark:text-base-500 w-6 text-right text-sm font-semibold tabular-nums"
						>
							{rank}
						</span>

						<Avatar
							src={entry.profile?.avatar}
							alt={entry.profile?.displayName ?? entry.did}
							class="size-10"
						/>

						<div class="min-w-0 flex-1">
							{#if entry.profile?.displayName}
								<div class="text-base-900 dark:text-base-50 truncate text-sm font-semibold">
									{entry.profile.displayName}
								</div>
							{/if}
							<div class="text-base-500 dark:text-base-400 truncate text-xs">
								@{entry.profile?.handle ?? entry.did}
							</div>
							{#if entry.images.length > 0}
								<div class="mt-2 flex gap-1">
									{#each entry.images as src}
										<img
											{src}
											alt=""
											class="border-base-200 dark:border-base-700 size-10 rounded-md border object-cover"
										/>
									{/each}
								</div>
							{/if}
						</div>

						<span
							class="bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200 self-start rounded-full px-3 py-1 text-sm font-semibold tabular-nums"
						>
							{entry.count}
						</span>
					</a>
				</li>
			{/each}
		</ol>

		{#if data.leaderboard.length === 0}
			<p class="text-base-500 dark:text-base-400 mt-12 text-center">No uploads yet.</p>
		{/if}

		<div class="mt-10 flex justify-center">
			<a
				href="/map/recent"
				class="text-accent-600 dark:text-accent-400 text-sm font-medium hover:underline"
			>
				View recent uploads on map
			</a>
		</div>
	</div>
</div>
