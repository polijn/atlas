// %%%%%%%%
// mostly code from flo-bit:
// https://github.com/flo-bit/svelte-swiper-cards
// %%%%%%%%

export type Direction = 'left' | 'right' | 'up' | 'down';

export type CardData = {
	title?: string;
	image?: string;
	[key: string]: unknown;
};

export type SwipeEventData = {
	direction: Direction;
	data: CardData;
	index: number;
	element: HTMLElement;
};

export type SwiperControls = {
	swipe: (direction?: Direction) => void;
};
