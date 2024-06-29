<div data-class="controls">
	<slot />
</div>

<style>
	div {
		background: rgba(1,1,1,0.7);
		position: absolute;
		display: flex;
		bottom: 2cqh;
		height: auto;
		width: 96cqw;
		padding: 0;
		margin: 0;
		align-items: end;
		justify-content: center;
		align-items: flex-end;
	}
	div > :global(div) {
		display: flex;
		flex-direction: column;
	}
	div :global(button) {
		color: white;
		background: transparent;
		border: solid 1px white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 4vh;
		margin: 0.3ex;
		transition: opacity 0.2s;
		opacity: 0.1;
	}
	:global(main:not([data-display='interactive'])) div:not(:hover) {
		transition: opacity 0.2s;
		opacity: 0;
	}
	div[data-class='controls']:hover :global(button):hover {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>
