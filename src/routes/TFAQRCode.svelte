<script lang="ts">
	import Card from "../components/Kit/Card.svelte";
	import { api } from "../api";
    import SvelteSegmentedInput from 'svelte-segmented-input';
	import { replace } from "svelte-spa-router";
	import { stLoggedUser } from "../stores";

    let qrLinkPromise = api.getQRCode();
    
    let value = "";
    let playWiggle = false;
    
    $: {
        if (value.length === 6) {
            validate();
        }
    }
    
    function validate() {
        let req = {
            code: value,
        };

        fetch("/api/auth/2fa", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req),
        })
            .then((res) => {
                if (res.status == 500) {
                    playWiggle = true;
                    setTimeout(() => {
                        playWiggle = false;
                    }, 300);
                    value = "";
                    qrLinkPromise = api.getQRCode();
                    // TODO: timeout
                } else if (res.status == 403) {
                    replace("/");
                } else if (res.status == 200) {
                    stLoggedUser.update((old) => {
                        if (old) {
                            old.tfa = true;
                        }
                        return old;
                    });
                    replace("/");
                } else if (res.status == 417) {
                    value = "";
                    playWiggle = true;
                    setTimeout(() => {
                        playWiggle = false;
                    }, 300);
                    return;
                }
            })
            .catch((e) => {
                console.error(e);
            });
	}
    
</script>

<div class="tfa">
    <Card>
        <div class="inner">
            {#await qrLinkPromise}
                <div class="qr" style={"background: white;"}/>
            {:then link} 
                <div class="qr" style={"background-image: url('" + link + "')"}/>
            {/await}
            <div class="desc">Scan this code with your 2FA application</div>
            <div class="desc">Then enter the 6-digit code below</div>
            <div class="input" class:playWiggle>
                <SvelteSegmentedInput bind:value length={6} style={{textColor: "white", borderColor: "gray"}}></SvelteSegmentedInput>
            </div>
        </div>
    </Card>
</div>

<style lang="scss">
    .tfa {
        height: 100vh;
        display: grid;
        place-items: center;        
    }
    
    @keyframes wiggle {
		0% {
			transform: translateX(-10px);
		}
		25% {
			transform: translateX(10px);
		}
		50% {
			transform: translateX(-10px);
		}
		75% {
			transform: translateX(10px);
		}
		100% {
			transform: translateX(0px);
		}
	}

	.playWiggle {
		animation: wiggle 0.3s infinite;
	}

    .inner {
        .qr {
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 16px;
            width: 400px;
            height: 400px;
            background-size: cover;
        }
        
        .input {
            margin-top: 10px;
            padding: 10px;
            border-radius: 20px;
        }
        
        .desc {
            text-align: center;
            font-size: 20px;
            line-height: 24px;
        }
    }
</style>
