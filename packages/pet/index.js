mp.events.add({
    
    "playerJoin" : (player) => {
        player.model = mp.joaat('ig_g');              
    },
        
    "pet:call" : (player) => {
        player.playAnimation('rcmnigel1c', 'hailing_whistle_waive_a', 1, 49);
        setTimeout(() => {
            player.stopAnimation();
            player.giveWeapon(mp.joaat('weapon_ball'), 1);
        }, 2000)               
    },

    "pet:getBall" : (player) => {
        player.giveWeapon(mp.joaat('weapon_ball'), 1);               
    },
       
});







