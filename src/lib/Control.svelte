<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import type { Writable } from 'svelte/store';

	export let key: string = '';
	export let desc: string | undefined = undefined;
	export let handler: KeyboardEventHandler<Window>;

	const hotkeyAdd: CallableFunction = getContext('hotkeyAdd');

	onMount(() => {
		// enable hotkey
		if (key) {
			hotkeyAdd(key, handler);
		}
		return () => {
			// disable hotkey
		};
	});
</script>

<button data-hotkey={key} on:click={handler}>
	{#if key}
		<kbd>{desc || key}</kbd>
	{/if}
	<slot />
</button>

<style>
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
