<script lang="ts">
	import { getContext, onMount, tick } from 'svelte';
	import Siren from './Siren.svelte';
	import type { Writable } from 'svelte/store';
	import Control from './Control.svelte';
	import Controls from './Controls.svelte';

	export let data: any | undefined;
	export let endpoint: string = 'gameclock';
	export let sirenMs: number = 1000;
	export let toggleKey = '';

	let now = new Date();
	let ms = now.getTime();

	let remaining_ms = 0;
	let prev_ms = 0;
	let clock_secs = 0;
	let clock_mins = 0;
	let disp_mins = 0;
	let disp_secs = 0;
	let disp_mils = 0;
	let disp = '0:00';
	let running = false;

	let siren: Siren;

	onMount(() => {
		const interval = setInterval(async () => {
			now = new Date();
			ms = now.getTime();
			remaining_ms = Math.max(
				0,
				(data?.last_time_remaining || 0) - (running ? ms - data?.last_state_change : 0)
			);

			clock_secs = remaining_ms / 1000;
			clock_mins = clock_secs / 60;
			disp_mils = Math.floor(remaining_ms) % 1000;
			disp_secs = Math.floor(clock_secs) % 60;
			disp_mins = Math.floor(clock_mins);
			disp =
				disp_mins > 0
					? `${disp_mins}:${(disp_secs + '').padStart(2, '0')}`
					: `${(disp_secs + '').padStart(2, '')}.${(Math.floor(disp_mils / 100) + '').padStart(1, '0')}`;

			if (prev_ms > 0 && remaining_ms == 0) {
				siren.beep(sirenMs);
				console.table({ prev_ms, remaining_ms });
			}
			prev_ms = remaining_ms;
			await tick();
		}, 10);

		return () => {
			clearInterval(interval);
		};
	});

	function update(newData: any | undefined) {
		// console.table({ state, newData });
		if (typeof newData == 'undefined') return;
		running = newData.state == 'Running';
	}

	$: update(data);

	function clockToggle() {
		fetch(`http://${location.hostname}:8000/clock/${endpoint}/${running ? 'stop' : 'start'}`, {
			method: 'post'
		});
	}
</script>

<!-- <div class="clock">{disp}</div> -->
<Siren bind:this={siren} />
{disp}
<Controls>
	<Control key={toggleKey} handler={clockToggle}>{running ? 'Stop' : 'Start'}</Control>
	<slot />
</Controls>
