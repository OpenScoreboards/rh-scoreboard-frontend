<script lang="ts">
	import { onMount } from 'svelte';
	import Scoreboard from '$lib/Scoreboard.svelte';

	let clock: string = '00:00';
	let home_score: string = '';
	let away_score: string = '';
	let api_data = {};
	let api_data_string: string = '';
	let exampleSocket: WebSocket;
	// let api_data: JSON = JSON.parse('{}');

	function pad(num: number, size: number): string {
		let result = '0000000000' + num.toString();
		return result.substring(result.length - size);
	}

	// setInterval(() => {
	//   const timeRemaining = clockEngine.getTimeRemaining();
	//   const timeString = `${pad(timeRemaining.getMinutes(), 2)}:${pad(timeRemaining.getSeconds(), 2)}`
	//   console.log(timeString);
	// }, 500);

	function startClock() {
		fetch(`http://${location.hostname}:8000/clock/gameclock/start`, { method: 'post' });
	}
	function stopClock() {
		fetch(`http://${location.hostname}:8000/clock/gameclock/stop`, { method: 'post' });
	}
	function setClock() {
		fetch(`http://${location.hostname}:8000/clock/gameclock/set?value=1500`, { method: 'post' });
	}

	function getTimeRemaining() {
		fetch('http://localhost:8000/data')
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				api_data_string = JSON.stringify(data);
				// console.log(data);
				let time = data['game_clock']['last_time_remaining'];
				if (data['game_clock']['state'] === 'Running') {
					let now = new Date().getTime();
					let last_state_change = data['game_clock']['last_state_change'];
					let timeSinceStateChange = Math.floor(now - last_state_change);
					time -= timeSinceStateChange;
				}
				let timeRemaining = time;
				clock =
					`${pad(Math.floor(timeRemaining / 60_000), 2)}:` +
					`${pad(Math.floor(timeRemaining / 1000) % 60, 2)}:` +
					`${pad(timeRemaining % 1000, 3)}`;

				home_score = data['home_score'];
				away_score = data['away_score'];
			})
			.catch((error) => {
				// console.error('Error:', error);
			});
	}

	function updateClock(api_data: any) {
		// console.log(api_data['game_clock']);
		if (api_data['game_clock'] === undefined) {
			return;
		}
		let time = api_data['game_clock']['last_time_remaining'];
		if (api_data['game_clock']['state'] === 'Running') {
			let now = new Date().getTime();
			let last_state_change = api_data['game_clock']['last_state_change'];
			let timeSinceStateChange = Math.floor(now - last_state_change);
			time -= timeSinceStateChange;
		}
		let timeRemaining = time;
		clock =
			`${pad(Math.floor(timeRemaining / 60_000), 2)}:` +
			`${pad(Math.floor(timeRemaining / 1000) % 60, 2)}:` +
			`${pad(timeRemaining % 1000, 3)}`;
	}

	// setInterval(async () => {
	// 	await getTimeRemaining();
	// }, 2000);

	onMount(() => {
		const backendUrl = location.hostname + ':8000';
		// console.log(backendUrl);
		exampleSocket = new WebSocket(`http://${backendUrl}/data_stream`);
		exampleSocket.onmessage = (event) => {
			api_data_string = event.data;
			api_data = JSON.parse(api_data_string);
			// console.log(api_data_string);
			home_score = api_data['home_score'].toString();
			away_score = api_data['away_score'].toString();
			updateClock(api_data);
		};
		exampleSocket.onerror = (ev) => {
			// console.log(ev);
		};

		// while (exampleSocket.readyState != WebSocket.OPEN) {}
		// exampleSocket.send('asdf');
		// getTimeRemaining();
		// console.log('after');

		window.onbeforeunload = function () {
			// exampleSocket.onclose = function () {}; // disable onclose handler first
			exampleSocket.close();
		};
	});
</script>

<p>
	{api_data_string}
</p>
<p>{clock}</p>
<p>Home: {home_score}</p>
<p>Away: {away_score}</p>
<button on:click={setClock}>set</button>
<button on:click={startClock}>start</button>
<button on:click={stopClock}>stop</button>
<button
	on:click={() => {
		console.log(exampleSocket);
	}}>stop</button
>

<div>

<Scoreboard />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		background-color: gray;
		color: white;
	}
	div {
		margin: 0;
		position:absolute;
		bottom: 0.1vh;
		height: 59.8vh;
		left: 0.1vw;
		width: 99.8vw;
		filter: opacity(0.9);
	}
</style>