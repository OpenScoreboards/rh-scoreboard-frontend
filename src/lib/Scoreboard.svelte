<script lang="ts">
	import { setContext, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import Clock from '$lib/Clock.svelte';
	import { minuteMs, secondMs, type connectionStateType, type GameInterface } from './types';
	import ConnectionStatus from './ConnectionStatus.svelte';
	import Controls from './Controls.svelte';
	import Control from './Control.svelte';
	import { Game, type GameJSON } from './backends/rh_scoreboard_backend';
	import Siren from './Siren.svelte';

	let game: GameInterface | null = null;
	let data: GameJSON | null = null;
	let horn: Siren | null = null;

	// context stores
	const dataStore: Writable<Object | null> = writable(null);
	setContext('data', dataStore);

	let audio: AudioContext | null = null;
	const audioStore: Writable<AudioContext | null> = writable(null);
	setContext('audio', audioStore);

	const stateStore: Writable<connectionStateType> = writable('idle');
	setContext('state', stateStore);

	function resumeAudio() {
		if (audio?.state == 'suspended') {
			audio.resume();
			console.log('Audio resumed.');
			audioStore.set(audio);
		}
	}
	onMount(() => {
		audio = new AudioContext();
		connect();
		return () => {};
	});
	function connect() {
		const backendUrl = location.hostname + ':8000';
		game = new Game(`${location.protocol}//${location.hostname}:8000/`);
		console.log(backendUrl);
		let socket = new WebSocket(`ws://${backendUrl}/data_stream`);
		stateStore.set('warn');
		socket.onmessage = (event) => {
			stateStore.set('good');
			data = JSON.parse(event.data);
			dataStore.set(data);
		};
		socket.onerror = (ev) => {
			stateStore.set('fail');
			dataStore.set(null);
			console.log(ev);
		};
		socket.onclose = (ev) => {
			stateStore.set('fail');
			socket.close();
			connect();
		};
	}

	// $: console.table({ data });

	const hotkeys: Map<string | number, { (): void }> = new Map();
	function hotkeyAdd(key: string | number, handler: { (): void }) {
		hotkeys.set(key, handler);
	}
	setContext('hotkeyAdd', hotkeyAdd);

	let focused = false;
	function keydown(ev: KeyboardEvent) {
		if (focused) return;
		for (const key of [ev.key, ev.code]) {
			const handler = hotkeys.get(key);
			if (typeof handler !== 'undefined') {
				ev.preventDefault();
				return handler();
			}
		}
	}
	function focus(ev: FocusEvent) {
		focused = document.activeElement?.tagName == 'input';
	}
</script>

<svelte:window on:keydown={keydown} on:focus={focus} />

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<svelte:document class="scoreboard" on:click={resumeAudio} on:keypress={resumeAudio} />

<main class="scoreboard">
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..700;1,100..700&display=swap');
		/* @import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&display=swap'); */
		@import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&family=Lekton:ital,wght@0,400;0,700;1,400&display=swap');
	</style>
	<div class="home">
		Home
		<div class="score">
			<div class="numbers">{data?.home_score}</div>
			<Controls>
				<Control key="s" handler={game?.home.scoreDecrement}>-</Control>
				<Control key="w" handler={game?.home.scoreIncrement}>+</Control>
			</Controls>
		</div>
		<div class="fouls">
			<div class="numbers">
				{data?.home_tf}
			</div>
			<Controls>
				<Control key="a" handler={game?.home.foulsDecrement}>-</Control>
				<Control key="d" handler={game?.home.foulsIncrement}>+</Control>
			</Controls>
		</div>
		<div class="tower">
			{#if data?.home_team_foul_warning}
				<span class="foul">F</span>
			{/if}
			{#if data?.home_team_timeout}
				<span class="timeout">T</span>
			{/if}
		</div>
	</div>
	<div class="away">
		Away
		<div class="score">
			<div class="numbers">{data?.away_score}</div>
			<Controls>
				<Control key="ArrowDown" desc="↓" handler={game?.away.scoreDecrement}>-</Control>
				<Control key="ArrowUp" desc="↑" handler={game?.away.scoreIncrement}>+</Control>
			</Controls>
		</div>
		<div class="fouls">
			<div class="numbers">
				{data?.away_tf}
			</div>
			<Controls>
				<Control key="ArrowLeft" desc="←" handler={game?.away.foulsDecrement}>-</Control>
				<Control key="ArrowRight" desc="→" handler={game?.away.foulsIncrement}>+</Control>
			</Controls>
		</div>
		<div class="tower">
			{#if data?.away_team_foul_warning}
				<span class="foul">F</span>
			{/if}
			{#if data?.away_team_timeout}
				<span class="timeout">T</span>
			{/if}
		</div>
	</div>
	<div class="game_clock">
		<div class="numbers">
			<Clock data={data?.game_clock} clock={game?.game_clock} toggleKey="Space">
				<Siren frequencies={[560, 1500]} bind:this={horn} />
				<Control
					key="h"
					handler={() => {
						horn?.beep(500);
					}}
				>
					Horn
				</Control>
				<div>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running') return;
							game?.game_clock.set(25 * minuteMs);
						}}
					>
						25m
					</Control>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running') return;
							game?.game_clock.set(20 * minuteMs);
						}}
					>
						20m
					</Control>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running') return;
							game?.game_clock.set(0);
						}}
					>
						0m
					</Control>
				</div>
				<div>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running' || !data?.game_clock.last_time_remaining)
								return;
							game?.game_clock.adjust(minuteMs);
						}}
					>
						+1m
					</Control>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running' || !data?.game_clock.last_time_remaining)
								return;
							game?.game_clock.adjust(-minuteMs);
						}}
					>
						-1m
					</Control>
				</div>
				<div>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running' || !data?.game_clock.last_time_remaining)
								return;
							game?.game_clock.adjust(10 * secondMs);
						}}
					>
						+10s
					</Control>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running' || !data?.game_clock.last_time_remaining)
								return;
							game?.game_clock.adjust(-10 * secondMs);
						}}
					>
						-10s
					</Control>
				</div>
				<div>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running' || !data?.game_clock.last_time_remaining)
								return;
							game?.game_clock.adjust(secondMs);
						}}
					>
						+1s
					</Control>
					<Control
						handler={() => {
							if (data?.game_clock.state == 'Running' || !data?.game_clock.last_time_remaining)
								return;
							game?.game_clock.adjust(-secondMs);
						}}
					>
						-1s
					</Control>
				</div>
			</Clock>
		</div>
	</div>
	<div class="shot_clock">
		<div class="numbers">
			<Clock data={data?.shot_clock} clock={game?.shot_clock} toggleKey=",">
				<Control
					key="."
					handler={() => {
						game?.shot_clock.set(45 * secondMs);
					}}
				>
					45s
				</Control>
			</Clock>
		</div>
	</div>
	<div class="status">
		<ConnectionStatus />
	</div>
</main>

<style>
	@keyframes blinker {
		50% {
			opacity: 0.33;
		}
	}
	.scoreboard {
		position: relative;
		background-color: black;
		color: white;
		height: 100%;
		width: 100%;
		container-type: size;
		font-family: 'Roboto', 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
			'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
	}
	.status {
		display: inline;
		position: absolute;
		bottom: 0;
		right: 0.5cqw;
		text-align: right;
		height: 3cqh;
		width: 20cqw;
		font-size: 2cqh;
		container-type: size;
	}
	.home,
	.away {
		position: absolute;
		width: 24cqw;
		height: 44cqh;
		text-align: center;
		font-size: min(8cqh, 3cqw);
		border: solid #222 1cqh;
		border-radius: 2cqh;
		top: 2cqh;
		container-type: size;
	}
	.score {
		container-type: size;
		height: 84cqh;
	}
	.fouls {
		container-type: size;
		height: 48cqh;
		color: yellow;
	}
	.tower {
		height: 44cqh;
		font-size: 35cqh;
	}
	.tower .foul,
	.tower .timeout {
		display: inline-block;
		width: 1em;
		height: 1em;
		line-height: 1em;
		border-radius: 2cqh;
		color: white;
		animation: blinker 1s ease-in-out infinite;
	}
	.tower .foul {
		background: red;
	}
	.tower .timeout {
		background: green;
	}
	.home {
		left: 1.5cqw;
	}
	.away {
		right: 1.5cqw;
	}
	.game_clock {
		position: absolute;
		top: 2cqh;
		left: 27.5cqw;
		width: 44cqw;
		height: 32cqh;
		text-align: center;
		border: solid #222 1cqh;
		border-radius: 2cqh;
		container-type: size;
	}
	.shot_clock {
		position: absolute;
		top: 75cqh;
		left: 32cqw;
		width: 36cqw;
		height: 22cqh;
		text-align: center;
		border: solid #222 1cqh;
		border-radius: 2cqh;
		container-type: size;
		color: red;
	}
	.numbers {
		vertical-align: middle;
		width: 100%;
		font-size: 98cqh;
		line-height: 106cqh;
		letter-spacing: 0.25ex;
		font-family: 'Lekton', monospace;
		font-optical-sizing: auto;
		font-weight: 700;
		font-style: normal;
		padding-left: 0.1ex;
	}
	.game_clock .numbers {
		font-size: min(98cqh, 30cqw);
	}
</style>
