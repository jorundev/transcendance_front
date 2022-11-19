<div class="center">
    <div class="mod">
        <div class="lds-dual-ring" />
        Connecting
    </div>
</div>

<style lang="scss">
	.center {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
        
        .mod {
            width: 400px;
            height: 400px;
            gap: 40px;
            text-align: center;
            justify-content: center;
            align-items: center;
            display: flex;
            flex-direction: column;
            font-size: 20px;
        }
	}
	.lds-dual-ring {
		display: inline-block;
		width: 80px;
		height: 80px;
	}
	.lds-dual-ring:after {
		content: " ";
		display: block;
		width: 64px;
		height: 64px;
		margin: 8px;
		border-radius: 50%;
		border: 6px solid #fff;
		border-color: #fff transparent #fff transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
