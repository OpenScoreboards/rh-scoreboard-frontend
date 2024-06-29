<script lang="ts">
	import { setContext, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import Clock from '$lib/Clock.svelte';
	import { minuteMs, secondMs, type Config, type GameInterface } from './types';
	import ConnectionStatus from './ConnectionStatus.svelte';
	import Controls from './Controls.svelte';
	import Control from './Control.svelte';
	import { Game as LocalGame } from './backends/local';
	import { Game, type GameJSON } from './backends/rh_scoreboard_backend';
	import Siren from './Siren.svelte';
	import Match from './Match.svelte';

	export let config: Config = {
		readonly: false,
		mute: false
	};
	let game: GameInterface = new LocalGame();
	let siren: Siren | null = null;
	let horn: Siren | null = null;
	let main: HTMLElement | null = null;

	// context stores
	const configStore: Writable<Config> = writable(config);
	setContext('config', configStore);

	$: configStore.set(config);

	let audio: AudioContext | null = null;
	const audioStore: Writable<AudioContext | null> = writable(null);
	setContext('audio', audioStore);

	function resumeAudio() {
		if (config.mute) return;
		if (audio?.state == 'suspended') {
			audio.resume();
			console.log('Audio resumed.');
			audioStore.set(audio);
		}
	}
	onMount(() => {
		const url = new URL(window.location.href);
		let preset = url.search.replace(/^\?/, '') || 'readonly';
		const defaults: Record<string, Config> = {
			readonly: {
				readonly: true,
				mute: true,
				borders: false
			},
			bench: {
				readonly: false,
				mute: false,
				borders: true
			},
			tv: {
				readonly: true,
				mute: false,
				borders: false
			}
		};
		if (Object.hasOwn(defaults, preset)) {
			config = defaults[preset];
		} else {
			preset = 'readonly';
			config = defaults.readonly;
		}
		console.table(config);
		const setAttr = (name: string, value: string | null) => {
			if (main == null) return;
			if (value == null) {
				main.removeAttribute(name);
			} else {
				main.setAttribute(name, value);
			}
		};
		setAttr('data-display', preset);
		setAttr('data-readonly', config.readonly ? '' : null);
		setAttr('data-mute', config.mute ? '' : null);
		setAttr('data-borders', config.borders ? '' : null);
		setAttr('data-interactive', config.readonly ? '' : null);
		audio = new AudioContext();
		game = new Game(`${location.protocol}//${location.hostname}:8000/`);
		return () => {};
	});

	const hotkeys: Map<string | number, { (): void }> = new Map();
	function hotkeyAdd(key: string | number, handler: { (): void }) {
		hotkeys.set(key, handler);
	}
	setContext('hotkeyAdd', hotkeyAdd);

	let focused = false;
	function keydown(ev: KeyboardEvent) {
		if (focused) return;
		if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
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

<main bind:this={main} class={`${config.borders ? 'borders' : ''}`}>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..700;1,100..700&display=swap');
		/* @import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&display=swap'); */
		@import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&family=Lekton:ital,wght@0,400;0,700;1,400&display=swap');
	</style>
	<div class="home">
		{$game.home.label}
		<div class="score">
			<div class="numbers">{$game.home.score}</div>
			<Controls>
				<div>
					<Control key="w" handler={game.home.scoreIncrement}>+</Control>
					<Control key="s" handler={game.home.scoreDecrement}>-</Control>
				</div>
				<Control
					handler={() => {
						const value = prompt('Home team name?', $game.home.label);
						if (value == null) return;
						game.home.labelSet(value);
					}}>⌨ Aa</Control
				>
			</Controls>
		</div>
		<div class="fouls">
			<div class="numbers">
				{$game.home.team_fouls}
			</div>
			<Controls>
				<Control key="a" handler={game.home.foulsDecrement}>-</Control>
				<Control key="d" handler={game.home.foulsIncrement}>+</Control>
			</Controls>
		</div>
		<div class="tower">
			<button
				on:click={$game.home.toggleFouls}
				class={`foul ${$game.home.foul_warning ? 'flash' : 'inactive'}`}
			>
				F
			</button>
			<button
				on:click={$game.home.toggleTimeout}
				class={`timeout ${$game.home.timeout_requested ? 'flash' : 'inactive'}`}
			>
				T
			</button>
		</div>
	</div>
	<div class="away">
		{$game.away.label}
		<div class="score">
			<div class="numbers">{$game.away.score}</div>
			<Controls>
				<div>
					<Control key="ArrowUp" desc="↑" handler={game.away.scoreIncrement}>+</Control>
					<Control key="ArrowDown" desc="↓" handler={game.away.scoreDecrement}>-</Control>
				</div>
				<Control
					handler={() => {
						const value = prompt('Away team name?', $game.away.label);
						if (value == null) return;
						game.away.labelSet(value);
					}}>⌨ Aa</Control
				>
			</Controls>
		</div>
		<div class="fouls">
			<div class="numbers">
				{$game.away.team_fouls}
			</div>
			<Controls>
				<Control key="ArrowLeft" desc="←" handler={game.away.foulsDecrement}>-</Control>
				<Control key="ArrowRight" desc="→" handler={game.away.foulsIncrement}>+</Control>
			</Controls>
		</div>
		<div class="tower">
			<button
				on:click={$game.away.toggleFouls}
				class={`foul ${$game.away.foul_warning ? 'flash' : 'inactive'}`}
			>
				F
			</button>
			<button
				on:click={$game.away.toggleTimeout}
				class={`timeout ${$game.away.timeout_requested ? 'flash' : 'inactive'}`}
			>
				T
			</button>
		</div>
	</div>
	<div class="game_clock">
		<div class="numbers">
			<Clock clock={game.game_clock} toggleKey="Space" siren={null}>
				<Control slot="pre" key="h" handler={game.toggleSiren}>Horn</Control>
				<Siren {audio} bind:this={siren} {game} />
				<Siren {audio} frequencies={[560, 1500]} bind:this={horn} />
				<div>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.set(25 * minuteMs);
						}}
					>
						25m
					</Control>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.set(20 * minuteMs);
						}}
					>
						20m
					</Control>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.set(0);
						}}
					>
						0m
					</Control>
				</div>
				<div>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.adjust(minuteMs);
						}}
					>
						+1m
					</Control>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.adjust(-minuteMs);
						}}
					>
						-1m
					</Control>
				</div>
				<div>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.adjust(10 * secondMs);
						}}
					>
						+10s
					</Control>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.adjust(-10 * secondMs);
						}}
					>
						-10s
					</Control>
				</div>
				<div>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.adjust(secondMs);
						}}
					>
						+1s
					</Control>
					<Control
						handler={() => {
							if ($game.game_clock.state == 'Running') return;
							game.game_clock.adjust(-secondMs);
						}}
					>
						-1s
					</Control>
				</div>
			</Clock>
		</div>
	</div>
	<div class="match_info">
		<Match {game} />
	</div>
	<div class="shot_clock">
		<div class="numbers">
			<Clock clock={game.shot_clock} toggleKey=",">
				<Control
					key="."
					handler={() => {
						game.shot_clock.set(45 * secondMs);
					}}
				>
					45s
				</Control>
			</Clock>
		</div>
	</div>
	<div class="status">
		<ConnectionStatus status={$game.connection_state} />
	</div>
</main>

<style>
	@keyframes blinker {
		50% {
			opacity: 0.33;
		}
	}
	main {
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
		border: solid transparent 1cqh;
		border-radius: 2cqh;
		top: 2cqh;
		container-type: size;
	}
	main.borders .game_clock,
	main.borders .shot_clock,
	main.borders .match_info,
	main.borders .home,
	main.borders .away {
		border-color: #222;
	}
	.score {
		container-type: size;
		height: 84cqh;
	}
	.fouls {
		margin-top: 6cqh;
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
		border: none;
		height: 44cqh;
		font-size: 35cqh;
		display: inline-block;
		width: 1em;
		height: 1em;
		line-height: 1em;
		border-radius: 2cqh;
		color: white;
		cursor: pointer;
	}
	.tower .inactive {
		opacity: 0.1;
	}
	.tower .flash {
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
		border: solid transparent 1cqh;
		border-radius: 2cqh;
		container-type: size;
	}
	.match_info {
		position: absolute;
		top: 37cqh;
		left: 27.5cqw;
		width: 44cqw;
		height: 15cqh;
		text-align: center;
		border: solid transparent 1cqh;
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
		border: solid transparent 1cqh;
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
