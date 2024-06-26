<script lang="ts">
	import { getContext } from 'svelte';
	import { type Writable } from 'svelte/store';
	import type { connectionStateType } from './types';

	const state: Writable<connectionStateType> = getContext('state');
</script>

<span class={$state}>●</span>

<style>
	@keyframes blinker {
		50% {
			opacity: 0.1;
		}
	}
	.fail,
	.idle,
	.warn {
		animation: blinker 1s linear infinite;
	}
	.good {
		color: green;
	}
	.warn {
		color: orange;
	}
	.fail {
		color: red;
	}
	.idle {
		color: gray;
	}
</style>
