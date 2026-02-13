<!-- 
mostly code from flo-bit:
https://github.com/flo-bit/svelte-swiper-cards

-->


<script lang="ts">
	import { onMount } from 'svelte';
	import { DragGesture, type FullGestureState } from '@use-gesture/vanilla';
	import type { CardData, Direction, SwipeEventData } from '.';
	import Card from './Card.svelte';

	let container: HTMLElement;

	let card1: HTMLElement, card2: HTMLElement;
	let card1Data: CardData, card2Data: CardData;

	let cardIndex = 0;
	let topCard: HTMLElement;
	let currentZ = 100000;

	onMount(async () => {
		card1Data = cardData(cardIndex++);
		card2Data = cardData(cardIndex++);

		[card1, card2].forEach(function (el) {
			el.style.zIndex = currentZ.toString();
			currentZ--;

			new DragGesture(el, (state) => {
				onDrag(el, state);
			});
		});

		topCard = card1;
		container.classList.remove('hidden');
	});

	const cardSwiped = (el: HTMLElement, velocity: [number, number], movement: [number, number]) => {
		// move card out of the view
		el.classList.add('transition-transform', 'duration-300');

		let isHorizontal = Math.abs(movement[0]) >= Math.abs(movement[1]);
		let direction: Direction;
		if (isHorizontal) {
			direction = movement[0] > 0 ? 'right' : 'left';
		} else {
			direction = movement[1] > 0 ? 'down' : 'up';
		}
		let data = el === card1 ? card1Data : card2Data;

		if (onSwipe) onSwipe({ direction, element: el, data, index: cardIndex - 2 });

		thresholdPassed = direction;

		let moveOutWidth = document.body.clientWidth;
		let moveOutHeight = document.body.clientHeight;

		let endX = Math.max(Math.abs(velocity[0]) * moveOutWidth, moveOutWidth);
		let toX = movement[0] > 0 ? endX : -endX;
		let endY = Math.max(Math.abs(velocity[1]) * moveOutHeight, moveOutHeight);
		let toY = movement[1] > 0 ? endY : -endY;

		if (!isHorizontal) {
			toX = movement[0] * 2;
		} else {
			toY = movement[1] * 2;
		}

		let rotate = movement[0] * 0.03 * (movement[1] / 80);

		el.style.transform = `translate(${toX}px, ${toY}px) rotate(${rotate}deg)`;

		setTimeout(() => {
			thresholdPassed = null;

			// move card back to start position at bottom of stack and update data
			if (el === card1) {
				card1Data = {};
				card1Data = cardData(cardIndex++);
				topCard = card2;
			} else {
				card2Data = {};
				card2Data = cardData(cardIndex++);
				topCard = card1;
			}

			currentZ--;
			el.style.zIndex = currentZ.toString();

			el.classList.remove('transition-transform', 'duration-300');
			el.style.transform = '';
		}, 350);
	};

	const onDrag = (
		el: HTMLElement,
		state: Omit<FullGestureState<'drag'>, 'event'> & {
			event: PointerEvent | MouseEvent | TouchEvent | KeyboardEvent;
		}
	) => {
		let elWidth = el.offsetWidth;

		if (state.active) {
			let rotate = state.movement[0] * 0.03 * (state.movement[1] / 80);

			// fix movement on a curved path if anchor is set
			if (anchor) {
				let vec = [state.movement[0], state.movement[1] - anchor];
				let len = Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
				vec = [(vec[0] / len) * anchor, (vec[1] / len) * anchor];

				state.movement[0] = vec[0];
				state.movement[1] = vec[1] + anchor;
			}

			el.style.transform = `translate(${state.movement[0]}px, ${state.movement[1]}px) rotate(${rotate}deg)`;

			let elHeight = el.offsetHeight;
			let isHorizontal = Math.abs(state.movement[0]) / elWidth >= Math.abs(state.movement[1]) / elHeight;

			if (isHorizontal && Math.abs(state.movement[0]) / elWidth > minSwipeDistance) {
				thresholdPassed = state.movement[0] > 0 ? 'right' : 'left';
			} else if (!isHorizontal && Math.abs(state.movement[1]) / elHeight > minSwipeDistance) {
				thresholdPassed = state.movement[1] > 0 ? 'down' : 'up';
			} else {
				thresholdPassed = null;
			}
			return;
		}
		// if dragging is finished
		let elHeight = el.offsetHeight;
		let keepHorizontal =
			Math.abs(state.movement[0]) / elWidth < minSwipeDistance &&
			Math.abs(state.velocity[0]) < minSwipeVelocity;
		let keepVertical =
			Math.abs(state.movement[1]) / elHeight < minSwipeDistance &&
			Math.abs(state.velocity[1]) < minSwipeVelocity;
		let keep = keepHorizontal && keepVertical;

		if (keep) {
			thresholdPassed = null;
			el.classList.add('transition-transform', 'duration-300');
			el.style.transform = '';
			setTimeout(() => {
				el.classList.remove('transition-transform', 'duration-300');
			}, 300);
		} else {
			cardSwiped(el, state.velocity, state.movement);
		}
	};

	export const swipe = (direction: Direction = 'right') => {
		if (thresholdPassed !== null) return;

		if (direction === 'left' || direction === 'right') {
			let dir = direction === 'left' ? -1 : 1;
			cardSwiped(topCard, [dir, 0.1], [dir, 0]);
		} else {
			let dir = direction === 'up' ? -1 : 1;
			cardSwiped(topCard, [0.1, dir], [0, dir]);
		}
	};

	export let onSwipe: ((cardInfo: SwipeEventData) => void) | undefined = undefined;

	export let cardData: (index: number) => CardData;

	export let minSwipeDistance: number = 0.5;
	export let minSwipeVelocity: number = 0.5;

	export let arrowKeys = true;

	export let thresholdPassed: Direction | null = null;

	export let anchor: number | null = null;
</script>

<svelte:body
	on:keydown={(e) => {
		if (!arrowKeys) return;
		if (e.key === 'ArrowLeft') {
			swipe('left');
		} else if (e.key === 'ArrowRight') {
			swipe('right');
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			swipe('up');
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			swipe('down');
		}
	}}
/>

<div class="w-full h-full">
	<div class="w-full h-full relative hidden z-0" bind:this={container}>
		<svelte:component this={Card} bind:element={card1} {...card1Data} />
		<svelte:component this={Card} bind:element={card2} {...card2Data} />
	</div>
</div>
