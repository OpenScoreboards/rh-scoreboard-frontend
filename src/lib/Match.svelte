<script lang="ts">
	import Control from './Control.svelte';
	import Controls from './Controls.svelte';
	import type { GameInterface } from './types';

	export let game: GameInterface;
</script>

<!-- <div class="clock">{disp}</div> -->
<div class="match">
	<h1>
		{#if $game.match_title}
			{$game.match_title}
		{:else}
			&nbsp;
		{/if}
	</h1>
	<div class="period">
		{#if $game.period == 0}
			&nbsp;
		{:else if $game.period == 1}
			Period 1
		{:else if $game.period == 2}
			Half-time
		{:else if $game.period == 3}
			Period 2
		{:else}
			Overtime {`${$game.period - 3}`}
		{/if}
	</div>
</div>
<Controls>
	<div>
		<Control handler={game.periodIncrement}>+</Control>
		<Control handler={game.periodDecrement}>-</Control>
	</div>
	<Control
		handler={() => {
			const value = prompt('Match title?', $game.match_title);
			game.setMatchTitle(value || '');
		}}>⌨ Aa</Control
	>
	<Control handler={game.reset}>⚠ CLEAR ALL</Control>
</Controls>

<style>
	.match {
		container-type: size;
		position: absolute;
		width: 100cqw;
		top: 0;
		height: 98cqh;
		font-size: 12cqh;
	}
	.period {
		vertical-align: middle;
		width: 100%;
		font-size: 20cqh;
		letter-spacing: 0.25ex;
		/* font-family: 'Lekton', monospace; */
		font-optical-sizing: auto;
		font-weight: 700;
		font-style: normal;
		padding-left: 0.1ex;
	}
</style>
