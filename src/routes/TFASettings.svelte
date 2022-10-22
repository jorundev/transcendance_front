<script lang="ts">
	import SideBar from "../components/SideBar.svelte";
</script>

<SideBar active="settings"/>
<div class="settings">
    <div class="title">Two-Factor Authentication</div>
</div>

<style lang="scss">
    
    .settings {
        
        margin-top: 30px;
        
        .title {
		    margin-bottom: 16px;
            margin-top: 10px;
            font-size: 28px;
        }
    }
    
    @media screen and (min-width: 800px) {
        .settings {
            margin-left: 68px;
        }
    }
</style>
