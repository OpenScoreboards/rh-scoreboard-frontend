<script lang="ts">
	let clock: string = '';
	let home_score: string = '';
	let away_score: string = '';
	let api_data: string = '';

	function pad(num: number, size: number): string {
		let result = num.toString();
		while (result.length < size) result = '0' + num;
		return result;
	}

	// setInterval(() => {
	//   const timeRemaining = clockEngine.getTimeRemaining();
	//   const timeString = `${pad(timeRemaining.getMinutes(), 2)}:${pad(timeRemaining.getSeconds(), 2)}`
	//   console.log(timeString);
	// }, 500);

	function startClock() {
		fetch('http://localhost:8000/clock/gameclock/start', { method: 'post' });
	}
	function stopClock() {
		fetch('http://localhost:8000/clock/gameclock/stop', { method: 'post' });
	}
	function setClock() {
		fetch('http://localhost:8000/clock/gameclock/set?value=10000', { method: 'post' });
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
				api_data = JSON.stringify(data);
				let time = data['game_clock']['last_time_remaining']['secs'];
				if (data['game_clock']['state'] === 'Running') {
					let now = new Date().getTime();
					let last_state_change = data['game_clock']['last_state_change'];
					let timeSinceStateChange = Math.floor((now - last_state_change) / 1000);
					time -= timeSinceStateChange;
				}
				let timeRemaining = time;
				clock = `${pad(Math.floor(timeRemaining / 60), 2)}:${pad(timeRemaining % 60, 2)}`;

				home_score = data['home_score'];
				away_score = data['away_score'];
			})
			.catch((error) => {
				console.error('Error:', error);
			});

		// let response = fetch('http://localhost:8000/data', {
		// 	mode: 'no-cors'
		// });
		// console.log(response);
		// timer = response['home_score'];
		// timer++;
		// let json = await response.json();
		// timer = json['home_score'] as number;
	}
	setInterval(() => {
		getTimeRemaining();
	}, 1000);
</script>

<p>
	{api_data}
</p>
<p>{clock}</p>
<p>Home: {home_score}</p>
<p>Away: {away_score}</p>
<button on:click={setClock}>set</button>
<button on:click={startClock}>start</button>
<button on:click={stopClock}>stop</button>
