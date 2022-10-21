<script lang="ts">
	import type { GameInviteNotificationData } from "../../notifications";
	import { api, APIStatus } from "../../api";
	import type { User } from "../../users";
    
    export let data: GameInviteNotificationData;
    let user: User = undefined;
    $: api.getUserData(data.user).then((data) => {
        if (data != APIStatus.NoResponse) {
            user = data;
        }
    });
</script>

<div class="invite">
    <div class="avatar"></div>
    <div class="resume">You got challenged by {user?.username}
        <div class="id">#{user?.identifier}</div>
    </div>
</div>

<style lang="scss">
    .invite {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    
    .resume {
        display: flex;
        
        .id {
            color: #787771;
        }
    }

    .avatar {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        border-radius: 100%;
        background-size: cover;
        background-image: url("/img/default.jpg");
    }
</style>
