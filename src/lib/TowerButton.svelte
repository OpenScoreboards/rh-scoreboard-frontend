<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Config, TeamInterface } from './types';

	export let team: TeamInterface;
	export let control: 'fouls' | 'timeout';

	$: letter = control == 'fouls' ? 'F' : 'T';
	$: active = control == 'fouls' ? $team.foul_warning : $team.timeout_requested;

	const config: Writable<Config> = getContext('config');

	function onclick() {
		if ($config.readonly) return;
		if (control == 'fouls') {
			team.toggleFouls();
		} else {
			team.toggleTimeout();
		}
	}
</script>

<button class={`${control} ${active ? 'active' : 'inactive'}`} on:click={onclick}>
	{letter}
</button>

<style>
	:global(main[data-readonly]) button {
		pointer-events: none;
	}
	:global(main:not([data-readonly])) button {
		cursor: pointer;
	}
	button {
        margin: 0 4cqh;
		display: block;
		border: none;
		width: 42cqw;
		height: 42cqw;
		font-size: 35cqw;
		line-height: 1em;
		border-radius: 2cqh;
		color: white;
		cursor: pointer;
        background: gray;
        container-type: size;
	}
	:global(main:is([data-layout='tower'])) button {
		width: 99cqw;
		height: 99cqw;
		font-size: 99cqw;
		margin: 4cqh 0;
	}
	.fouls {
		background: red;
	}
	.timeout {
		background: green;
	}
	@keyframes blinker {
		50% {
			opacity: 0.33;
		}
	}
	.active {
		animation: blinker 1s ease-in-out infinite;
	}
	.inactive {
		opacity: 0.07;
	}
</style>
