<!-- 
mostly code from flo-bit:
https://github.com/flo-bit/svelte-swiper-cards
-->
<script lang="ts">
	export let element: HTMLElement;

	export let title: string = '';
	export let description: string = '';
	export let image: string | undefined = undefined;
</script>


<div
	class="w-full h-full absolute cursor-grab ease-in-out rounded-xl touch-none select-none border border-black bg-black"
	bind:this={element}
>
<div class="p-4 absolute w-full flex justify-center">
  <div class="flex items-center flex-col">
    <div class="bg-accent-600/50 text-white px-6 py-2 rounded-lg text-center">
      <h3 class="text-3xl font-semibold">{title}</h3>
      <p>{description}</p>
    </div>
  </div>
</div>
	{#key image}
		{#if image}
			<img class="w-full h-full rounded-xl object-contain" src={image} alt={title} />
		{/if}
	{/key}
</div>
