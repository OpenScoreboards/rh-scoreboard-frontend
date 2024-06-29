<script lang="ts">
	import Scoreboard from '$lib/Scoreboard.svelte';
	import { secondMs } from '$lib/types';
	import { onMount } from 'svelte';

	let wakeLock: WakeLockSentinel | undefined = undefined;

	async function requestWakeLock() {
		if (!navigator.wakeLock) {
			console.log('No wakelock available');
			return;
		}
		try {
			console.log('WakeLock requested...');
			wakeLock = await navigator.wakeLock.request('screen');
			console.log('WakeLock aquired.');

			wakeLock.addEventListener('release', () => {
				wakeLock = undefined;
				console.log('WakeLock released.');
			});
		} catch (err) {
			console.log(`WakeLock error: ${err}`);
			wakeLock = undefined;
		}
	}

	onMount(() => {
		if (!isSecureContext) {
			console.log('WakeLock not available in insecure context.');
			return;
		}
		setInterval(async () => {
			if (typeof wakeLock == 'undefined') await requestWakeLock();
		}, 10 * secondMs);
	});
</script>

<Scoreboard />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		background-color: black;
		color: white;
		height: 100vh;
		width: 100vw;
	}
</style>
