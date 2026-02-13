<script lang="ts">
	import { user } from '$lib/atproto';
	import { loginModalState } from '$lib/atproto/UI/LoginModal.svelte';
	import AddImagesButton from '$lib/components/AddImagesButton.svelte';
	import { Alert } from '@foxui/core';
</script>

<div class="bg-base-50 dark:bg-base-950 flex h-dvh flex-col items-center px-6 pt-32">
	<div class="w-full max-w-3xl">
		<h1 class="text-base-900 dark:text-base-50 text-3xl font-bold">Crowdsourced geo images</h1>
		<p class="text-base-600 dark:text-base-300 mt-6 max-w-sm text-base">
			Upload geotagged photos to share on the map.
		</p>

		<Alert type="warning" class="mt-4" title="All uploaded images are public and CC0">
			<span>Only upload images that you own all rights to.</span>
		</Alert>

		{#if user.isLoggedIn}
			<AddImagesButton class="my-10 px-12 py-5 text-lg font-bold">Upload images</AddImagesButton>
			<div class="flex flex-wrap gap-3">
				{#if user.profile}
					<a
						type="button"
						class="bg-base-300 hover:bg-base-200 dark:bg-base-800 dark:hover:bg-base-700 cursor-pointer rounded-full px-4 py-3 text-sm font-semibold text-black shadow-lg transition-all active:scale-95 dark:text-white"
						href="/map/{user.profile.handle}"
					>
						See your uploaded images
					</a>
				{/if}
				<a
					class="bg-base-300 hover:bg-base-200 dark:bg-base-800 dark:hover:bg-base-700 cursor-pointer rounded-full px-4 py-3 text-sm font-semibold text-black shadow-lg transition-all active:scale-95 dark:text-white"
					href="/vote"
				>
					Vote on POIs
				</a>
			</div>
		{:else if !user.isInitializing}
			<button
				type="button"
				class="bg-accent-600 hover:bg-accent-500 mt-10 cursor-pointer rounded-full px-12 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95"
				onclick={() => loginModalState.show()}
			>
				Sign in to upload
			</button>
		{:else}
			<div class="text-base-800 dark:text-base-200 mt-10 text-xl font-semibold">Loading...</div>
		{/if}
	</div>
</div>
