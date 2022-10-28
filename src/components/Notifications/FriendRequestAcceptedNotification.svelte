<script lang="ts">
	import type { AcceptedFriendRequestNotificationData } from "../../notifications";
	import { api, APIStatus } from "../../api";
	import type { User } from "../../users";
    
    export let data: AcceptedFriendRequestNotificationData;
    let user: User = undefined;
    $: api.getUserData(data.user).then((data) => {
        if (data != APIStatus.NoResponse) {
            user = data;
        }
    });
</script>

<div class="invite">
    <div class="icons">
        <div class="logo"></div>
        <div class="avatar"></div>
    </div>
    <div class="resume">
        <div class="inner">
            <div class="username">{user?.username}<div class="id">#{user?.identifier}</div></div>
            <div>accepted your friend request</div>
        </div>
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
        
        .inner {
            display: flex;
            gap: 0.44ch;
        }
    }
    
    .username {
        display: flex;
    }
    
    .icons {
        display: flex;
        gap: 4px;
    }
    
    .logo {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        background-size: 80%;
        background-position: center;
        background-repeat: no-repeat;
        background-image: url("/img/check.png");
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
