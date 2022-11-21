<script lang="ts">
	import Card from "../components/Kit/Card.svelte";
	import { api, type TFAInitResponse } from "../api";
    import SvelteSegmentedInput from 'svelte-segmented-input';
	import { replace } from "svelte-spa-router";
	import { stLoggedUser } from "../stores";

    let qrLinkPromise = api.getQRCode();
    let tip = false;
    
    let value = "";
    let playWiggle = false;
    
    let errorText = "";
    
    async function goBackIfError(prom: Promise<TFAInitResponse>) {
        if (await prom === null) {
            replace("/");
        }
    }
    
    $: goBackIfError(qrLinkPromise);
    
    $: {
        if (value.length === 6) {
            validate();
        }
    }
    
    function onClick(ev: Event)
    {
        if (navigator.clipboard.write !== undefined) {
            const text = (ev.target as any).innerText;
            if (tip) {
                return ;
            }
            const type = "text/plain";
            const blob = new Blob([text], { type });
            const data = [new ClipboardItem({ [type]: blob })];
            
            navigator.clipboard.write(data).then(
                () => {
                    tip = true;
                    setTimeout(() => tip = false, 1000);
                }
            );
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
                if (res.status == 403) {
                    errorText = "Timeout. QR code regenerated";
                    qrLinkPromise = api.getQRCode();
                    return ;
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
            {:then response} 
            <div class="qr" style={"background-image: url('" + response?.image + "')"}/>
                {#if errorText.length > 0}
                    <div style="color: red; padding-bottom: 10px;">{errorText}</div>
                {/if}
                <div class="desc">Scan this QR code with your 2FA application</div>
                <div class="desc">or copy and paste this text in it</div>
                <div class="qr-text" class:tip on:click={onClick}>{response?.text}</div>
                <div class="desc">Then enter the 6-digit code below</div>
            {/await}
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
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        max-width: 600px;
        
        .qr {
            margin-bottom: 16px;
            width: 400px;
            height: 400px;
            background-size: cover;
        }
        
        .qr-text {
            user-select: all;
            -webkit-user-select: all;
            margin-top: 6px;
            margin-bottom: 6px;
            word-break: break-all;
            background-color: #2f2f2f;
            border-radius: 10px;
            padding: 10px;
            font-weight: bold;
            font-size: 12px;
            line-height: 16px;
            position: relative;
            
            &.tip::after {
                content: "Copied!";
                font-size: 2em;
                background-color: rgba(0, 0, 0, 0.763);
                display: grid;
                place-items: center;
                position: absolute;
                border-radius: 10px;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        }
        
        .input {
            width: 100%;
            max-width: 420px;
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
