
<style>
	div {
		position: absolute;
		display: flex;
		bottom: 1cqh;
		height: 15cqh;
		width: 96cqw;
		padding: 0;
		margin: 0;
        align-items: center;
        justify-content: center;
	}
	div :global(button) {
		/* flex: 1; */
		color: white;
		background: transparent;
		border: solid 1px white;
		border-radius: 4px;
		filter: opacity(0.1);
		cursor: pointer;
		font-size: 10cqh;
        margin: 0.3ex;
	}
	div :global(button):hover {
		filter: none;
	}
</style>

<div>
    <slot />
</div>