<script lang="ts">
	import Session from "../components/Session.svelte";
    import { onMount } from "svelte";
	import { api, APIStatus, type Session as SessionData } from "../api";
	import SideBar from "../components/SideBar.svelte";
    
    let active_sessions: Array<SessionData> = [];
    let inactive_sessions: Array<SessionData> = [];
        
    async function reloadSessions() {
        const res = await api.getSessions();
        if (res == APIStatus.NoResponse) {
            return ;
        }
        inactive_sessions = res.data.filter((session) => !session.active);
        active_sessions = res.data.filter((session) => session.active);
    }
    
    onMount(async () => {
        await reloadSessions();
    });
</script>

<SideBar active="settings"/>
<div class="sessions">
    <div class="category">Active sessions</div>
    {#each active_sessions as session (session.id)}
        <Session {session} on:kill={async () => await reloadSessions()}/>
    {/each}
    <div class="category">Inactive sessions</div>
    {#each inactive_sessions as session (session.id)}
        <Session {session} />
    {/each}
</div>

<style lang="scss">
    .sessions {
        overflow-y: auto;
    }
    
    @media screen and (min-width: 800px) {
        .sessions {
            margin-left: 52px;
        }
    }
    
    .category {
        font-size: 20px;
        margin-top: 20px;
        margin-left: 20px;
    }
</style>
