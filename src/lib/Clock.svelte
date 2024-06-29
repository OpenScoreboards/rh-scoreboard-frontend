<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Control from './Control.svelte';
	import Controls from './Controls.svelte';
	import type { ClockInterface } from './types';
	import Siren from './Siren.svelte';
	// import { minuteMs, secondMs } from './types';

	// export let formats: string[] = ['1:00', '10', '0.0'];
	export let clock: ClockInterface;
	export let toggleKey = '';
	export let persistAfterZeroMs: number | null = null;
	export let siren: Siren | null | undefined = undefined;

	let sirenMs = 1000;

	interface Format {
		ms: number;
		format: { (ms: number): string };
	}

	// $: formatters = formats.map((fmt) => {
	// 	let ms = 0; // value shown in fmt.  Eg: '1:00' (1 hour) -> 3,600,000 ms
	// 	const vals = fmt.split(':').map(Number.parseFloat);
	// 	const digits_pre = fmt.split(':').map((val)=>val.split('.')[0].length);
	// 	const digits_pre = fmt.split(':').map((val)=>val.split('.')[0].length);
	// 	const multipliers = [60 * minuteMs, minuteMs, secondMs].slice(3 - vals.length);
	// 	for(const [i, val] of vals.entries()) {
	// 		const multiplier = multipliers.shift();
	// 		if(typeof multiplier == 'undefined') throw(`Invalid format: ${fmt}`)
	// 		const len = lens.shift();
	// 		ms += val * multiplier;
	// 	}
	// 	if(vals.length == 1) {

	// 	} else if (vals.length == 2) {

	// 	}
	// 	return
	// })
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
	let prev_running = false;

	onMount(() => {
		const interval = setInterval(async () => {
			now = new Date();
			ms = now.getTime();
			remaining_ms = Math.max(
				0,
				$clock.last_time_remaining - (running ? ms - $clock.last_state_change : 0)
			);

			clock_secs = remaining_ms / 1000;
			clock_mins = clock_secs / 60;
			disp_mils = Math.floor(remaining_ms) % 1000;
			disp_secs = Math.floor(clock_secs) % 60;
			disp_mins = Math.floor(clock_mins);
			disp =
				clock_secs > 10
					? disp_mins > 0
						? `${disp_mins}:${(disp_secs + '').padStart(2, '0')}`
						: `${(disp_secs + '').padStart(2, '0')}`
					: `${(disp_secs + '').padStart(2, '')}.${(Math.floor(disp_mils / 100) + '').padStart(1, '0')}`;

			if (prev_ms > 0 && remaining_ms == 0 && prev_running) {
				if (siren) siren.beep(sirenMs);
				// console.table({ prev_ms, remaining_ms, prev_running });
			}
			if (
				persistAfterZeroMs !== null &&
				remaining_ms == 0 &&
				ms > $clock.last_state_change + persistAfterZeroMs
			) {
				disp = '';
			}
			prev_ms = remaining_ms;
			prev_running = running;
			await tick();
		}, 10);

		return () => {
			clearInterval(interval);
		};
	});

	$: running = $clock.state == 'Running';

	function clockToggle() {
		if (running) {
			clock?.stop();
		} else {
			clock?.start();
		}
	}
</script>

<!-- <div class="clock">{disp}</div> -->
{disp}
<Controls>
	{#if siren !== null}
		<Siren bind:this={siren} />
	{/if}
	<div>
		<slot name="pre" />
		<Control key={toggleKey} handler={clockToggle}>{running ? 'Stop' : 'Start'}</Control>
		<slot name="post" />
	</div>
	<slot />
</Controls>
