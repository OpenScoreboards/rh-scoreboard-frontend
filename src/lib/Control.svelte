<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Config } from './types';
	import type { UIEventHandler } from 'svelte/elements';

	export let key: string = '';
	export let desc: string | undefined = undefined;
	export let handler: UIEventHandler<HTMLButtonElement> | undefined;
	export let handlerRelease: UIEventHandler<HTMLButtonElement> | undefined = undefined;

	const hotkeyAdd: CallableFunction = getContext('hotkeyAdd');

	$: key && handler !== null && hotkeyAdd(key, handler, handlerRelease);
</script>

<button class="control" data-hotkey={key} on:click={handler}>
	{#if key}
		<kbd>{desc || key}</kbd>
	{/if}
	<slot />
</button>

<style>
	:global(main[data-readonly]) button {
		opacity: 0;
	}
	:global(div[data-class='controls']:hover) {
		background: rgba(1, 1, 1, 0.8);
	}
	:global(div[data-class='controls']:hover) button {
		opacity: 0.5;
	}
	:global(main[data-readonly]) :global(div[data-class='controls']:not(+ :hover)) button {
		pointer-events: none;
	}
	kbd {
		display: inline-block;
		height: 1.2em;
		line-height: 1.2em;
		font-size: 80%;
		vertical-align: middle;
		min-width: 1em;
		padding: 0.3ex;
		background: ivory;
		color: black;
		border: solid 1px black;
		border-radius: 4px;
		box-shadow: 0.1ex 0.1ex #ddd;
	}
</style>
