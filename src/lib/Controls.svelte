<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Config } from './types';

	const config: Writable<Config> = getContext('config');

	$: console.table($config);
</script>

<div data-class="controls" data-readonly={`${$config.readonly}`}>
	<slot />
</div>

<style>
	div[data-readonly='true'] {
		visibility: hidden;
	}
	div {
		background: rgba(1, 1, 1, 0.7);
		position: absolute;
		display: flex;
		bottom: 2cqh;
		height: 96cqh;
		width: 96cqw;
		padding: 0;
		margin: 0;
		align-items: end;
		justify-content: center;
		align-items: flex-end;
	}
	div > :global(div) {
		display: flex;
		flex-direction: column;
	}
	div :global(button) {
		color: white;
		background: transparent;
		border: solid 1px white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 4vh;
		margin: 0.3ex;
		transition: opacity 0.2s;
		opacity: 0.1;
	}
	div:not(:hover) {
		transition: opacity 0.2s;
		opacity: 0.9;
	}
	div[data-class='controls']:hover :global(button):hover {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>
