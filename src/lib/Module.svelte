<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Config } from './types';

	export let label: string = '';

	const config: Writable<Config> = getContext('config');
	$: borders=$config.borders ? 'true' : 'false';
</script>

{#if label}
	<span data-borders={borders}>{label}</span>
{/if}
<div data-borders={borders}>
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
		overflow: hidden;
	}
	div[data-borders='true'] {
		border-color: #111;
	}
	span {
		position: absolute;
		z-index: 1;
		display: block;
		top: -0.5vh;
		color: #444;
		font-size: 2vh;
		line-height: 2vh;
		padding-left: 2ex;
	}
	span[data-borders="false"] {
		visibility: hidden;
	}
</style>
