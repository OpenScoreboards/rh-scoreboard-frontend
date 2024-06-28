<script lang="ts">
	import type { connectionStateType } from './types';

	export let status: connectionStateType;
</script>

<span class={status}>●</span>

<style>
	@keyframes blinker {
		50% {
			opacity: 0.1;
		}
	}
	.fail,
	.idle,
	.warn {
		animation: blinker 1s linear infinite;
	}
	.good {
		color: green;
	}
	/* :global(main[data-display=interactive]) .good {
		color: green;
	} */
	.warn {
		color: orange;
	}
	.fail {
		color: red;
	}
	.idle {
		color: gray;
	}
</style>
