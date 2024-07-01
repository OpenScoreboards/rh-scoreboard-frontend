<script lang="ts">
	import Control from './Control.svelte';
	import Controls from './Controls.svelte';
	import Label from './Label.svelte';
	import type { GameInterface } from './types';

	export let game: GameInterface;
</script>

<!-- <div class="clock">{disp}</div> -->
<div class="match">
	<Label>
		{#if $game.match_title}
			{$game.match_title}
		{:else}
			&nbsp;
		{/if}
	</Label>
</div>
<div class="period">
	<Label>
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
	</Label>
</div>
<Controls>
	<div>
		<Control handler={game.periodIncrement}>+ Period</Control>
		<Control handler={game.periodDecrement}>- Period</Control>
	</div>
	<Control
		handler={() => {
			const value = prompt('Match title?', $game.match_title);
			game.setMatchTitle(value || '');
		}}>⌨ Aa</Control
	>
	<Control
		handler={() => {
			const value = prompt(
				'Reset match?\n\nThe scoreboard will be cleared!\n\nType "yes" to confirm.',
				''
			);
			if ((value || '').toLowerCase() == 'yes') game.reset();
		}}>⚠ RESET</Control
	>
	<slot />
</Controls>

<style>
	.match {
		container-type: size;
		position: absolute;
		width: 100cqw;
		top: 0;
		left: 0;
		height: 50cqh;
	}
	.period {
		container-type: size;
		position: absolute;
		width: 100cqw;
		top: 60cqh;
		left: 0;
		height: 40cqh;
	}
</style>
