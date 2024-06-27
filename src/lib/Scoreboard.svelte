<script lang="ts">
	import { setContext, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import Clock from '$lib/Clock.svelte';
	import { type connectionStateType } from './types';
	import ConnectionStatus from './ConnectionStatus.svelte';

	let data: any | null = null;

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
		console.log(backendUrl);
		let socket = new WebSocket(`http://${backendUrl}/data_stream`);
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

	$: console.table({ data });

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
		</div>
		<div class="fouls">
			<div class="numbers">
				{data?.home_tf}
			</div>
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
		</div>
		<div class="fouls">
			<div class="numbers">
				{data?.away_tf}
			</div>
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
			<Clock data={data?.game_clock} />
		</div>
	</div>
	<div class="shot_clock">
		<div class="numbers">
			<Clock data={data?.shot_clock} />
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
		position: relative;
		top: 97cqh;
		left: 99cqw;
		text-align: right;
		height: 1em;
		width: 1em;
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
		color: red;
	}
	.tower {
		height: 44cqh;
		font-size: 35cqh;
	}
	.tower .foul, .tower .timeout {
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
		left: 33cqw;
		width: 34cqw;
		height: 22cqh;
		text-align: center;
		border: solid #222 1cqh;
		border-radius: 2cqh;
		container-type: size;
		color: yellow;
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
