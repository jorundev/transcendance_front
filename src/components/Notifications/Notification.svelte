<script lang="ts">
	import { createEventDispatcher } from "svelte";

    let dispatch = createEventDispatcher();
</script>

<div class="notification">
    <div class="dismiss" on:click={() => dispatch("dismiss")}/>
    <div class="content">
        <slot />
    </div>
</div>

<style lang="scss">
    .notification {
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        padding: 10px;
        border-radius: 10px;
        background: rgb(18, 18, 18);
        border: 1px solid rgb(50, 50, 50);
        
        .dismiss {
            display: none;
            position: absolute;
            width: 20px;
            height: 20px;
            background-image: url("/img/cross.png");
            background-size: cover;
            opacity: 0.5;
            cursor: pointer;
            right: 18px;
        }
        
        &:hover {
            .dismiss {
                display: block;
            }
            
            background: rgb(50, 50, 50);
        }
    }
</style>
