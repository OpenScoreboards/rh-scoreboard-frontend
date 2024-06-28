<script lang="ts">
	import { type GameInterface } from './types';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Game } from './backends/local';

	export let audio: AudioContext | null = null;
	export let game: GameInterface | null = null;
	export let frequencies: number[] = [480, 560];

	let gainNode: GainNode | null = null;

	const audioStore: Writable<AudioContext | null> = getContext('audio');

	let trigger: boolean | undefined = game?.siren;
	let prevTrigger: boolean | undefined = !game?.siren;

	$: (() => {
		if ($game == null) return;
		trigger = $game.siren;
		if (trigger && !prevTrigger) beep(1000);
		prevTrigger = trigger;
	})();

	function connectAudio(newAudio: AudioContext | null) {
		if (newAudio === null || gainNode !== null) return;
		if (audio === null) {
			audio = newAudio;
		} else {
			newAudio = audio;
		}
		gainNode = newAudio.createGain();
		gainNode.gain.value = 0; // no volume
		gainNode.connect(newAudio.destination);

		console.log('Siren connected.');
	}
	$: connectAudio($audioStore);

	export function beep(durationMs: number) {
		if (audio === null || gainNode === null) return;
		let oscillators: OscillatorNode[] = [];
		for (const frequency of frequencies) {
			let oscillator = audio.createOscillator();
			oscillators.push(oscillator);
			oscillator.type = 'square';
			oscillator.frequency.value = frequency;
			oscillator.connect(gainNode);
			oscillator.start();
		}
		gainNode.gain.setValueAtTime(0, audio.currentTime);
		gainNode.gain.linearRampToValueAtTime(1, audio.currentTime + 0.01);
		console.log('BEEP!');

		setTimeout(() => {
			if (audio === null || gainNode === null) return;
			gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1);
			for (const oscillator of oscillators) {
				oscillator.stop(audio.currentTime + 1);
			}
			console.log('silence...');
		}, durationMs);
	}
</script>
