<script lang="ts">
	export let maxChars: number;
</script>

<div data-maxChars={`${maxChars}`}>
	<slot />
</div>

<style>
	div {
		vertical-align: middle;
		height: 100cqh;
		width: 100cqw;
		line-height: 100cqh;
		letter-spacing: 0.05ex;
		font-family: 'Noto Sans JP Variable', sans-serif;
		font-optical-sizing: auto;
		font-weight: 700;
		font-style: normal;
	}
	:global(main[data-userAgent*='Firefox']) div {
		font-weight: 700;
	}
	div:is([data-maxChars='1']) {
		font-size: 100cqh;
	}
	div:is([data-maxChars='2']) {
		font-size: min(100cqh, 82cqw);
	}
	div:is([data-maxChars='3']) {
		font-size: min(100cqh, 53cqw);
	}
	div:is([data-maxChars='4']) {
		font-size: min(100cqh, 39cqw);
	}
	div:is([data-maxChars='5']) {
		font-size: min(100cqh, 32cqw);
	}
</style>
