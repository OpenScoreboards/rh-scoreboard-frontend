
<style>
	div {
		position: absolute;
		display: flex;
		bottom: 1cqh;
		height: auto;
		width: 96cqw;
		padding: 0;
		margin: 0;
        align-items:end;
        justify-content: center;
		/* align-content: flex-end; */
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
		font-size: 1.7vh;
        margin: 0.3ex;
		transition: opacity 0.2s;
		opacity: 0.1;
	}
	div :global(button):hover {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>

<div>
    <slot />
</div>