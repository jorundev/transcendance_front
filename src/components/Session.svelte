<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { api, type Session } from "../api";
	import Button from "./Kit/Button.svelte";
    export let session: Session;

    let browser = "browser";
    let date = "";
    
    let dispatch = createEventDispatcher();
    
    $: date = new Date(session.creation_date).toLocaleString();
    
    $: {
        if (session.platform.includes("Firefox")) {
            browser = "firefox";
        } else if (session.platform.includes("Chrome")) {
            browser = "chrome";
        } else if (session.platform.includes("Chromium")) {
            browser = "chromium";
        } else if (session.platform.includes("Edge")) {
            browser = "edge";
        } else if (session.platform.includes("Opera")) {
            browser = "opera";
        } else if (session.platform.includes("Safari")) {
            browser = "safari";
        } else {
            browser = "browser";
        }
    }
</script>

<div class="session" class:inactive={!session.active}>
    <div class="browser-info">
        <div class="browser-icon" style={"flex-shrink:0;background-image: url('/img/browsers/" + browser + ".png');"} />
        <div class="title">{session.platform}</div>
    </div>
    <div class="date">({date})</div>
    {#if session.active}
        <div class="button">
            <Button red on:click={async () => {
                const res = await api.killSession(session.id);
                dispatch("kill");
            }}>Revoke</Button>
        </div>
    {/if}
</div>

<style lang="scss">
    .session {
        display: flex;
        align-items: center;
        gap: 0.44ch;
        margin-top: 18px;
        margin-left: 18px;
        margin-right: 18px;
        background: rgb(20, 20, 20);
        padding: 20px;
        border-radius: 20px;
        
        &.inactive {
            opacity: 0.6;
        }
        
        .browser-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .date {
            color: rgb(103, 103, 103);
        }
        
        .button {
            width: 100%;
            max-width: 200px;
            margin-left: auto;
            margin-right: 10px;
        }
    }
    .browser-icon {
        width: 40px;
        height: 40px;
        background-size: cover;
    }
    
    @media screen and (max-width: 800px) {
        .session .button {
            max-width: 96px;
        }
    }
</style>
