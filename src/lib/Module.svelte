<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Config } from './types';

	export let label: string = '';

	const config: Writable<Config> = getContext('config');
</script>

<div data-borders={$config.borders ? 'true' : 'false'}>
	{#if label}
		<span>{label}</span>
	{/if}
	<slot />
</div>

<style>
	div {
		position: absolute;
		height: 100cqh;
		width: 100cqw;
		box-sizing: border-box;
		border: solid transparent 1vh;
		border-radius: 2vh;
		container-type: size;
	}
	div[data-borders='true'] {
		border-color: #111;
	}
	span {
		position: absolute;
		display: block;
		top: -1.5vh;
		color: #444;
		font-size: 2vh;
		line-height: 2vh;
		padding-left: 2ex;
	}
	div[data-borders="false"] span {
		visibility: hidden;
	}
</style>
