const misc = require('cMisc.js');
const player = mp.players.local;
let ped = false;
let ballThrown = false;


//Event to reload anims to stream it
function playerSpawn() {
    mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@world_dog_sitting@exit");
    mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@world_dog_sitting@base");
    mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@sleep_in_kennel@");
    mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@world_dog_sitting@exit");
}
mp.events.add("playerSpawn", playerSpawn);

//Function to freeze pet
function freezePet(pet, status) {
    if(pet){
        pet.freezePosition(status);
        pet.freeze = status;
        mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@world_dog_sitting@exit");
        pet.taskPlayAnim("creatures@rottweiler@amb@world_dog_sitting@exit", "exit", 1, 1.0, -1, 0, 1.0, false, false, false);
    }
}

//Function to find ball
function findBall(pet) {
    if(pet){
        let ball = mp.game.object.getClosestObjectOfType(pet.getCoords(false).x, pet.getCoords(false).y, pet.getCoords(false).z, 100.0, mp.game.joaat('w_am_baseball'), false, true, true);
        const pweapon = mp.game.invoke(`0x0A6DB4965674D243`, player.handle);
        if(ball && pweapon != mp.game.joaat('weapon_ball')) {
            mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota va en busca de la pelota", "CHAR_CHOP", 7, true);
            
            /*               
                I have managed to detect that there is a ball near the player's position, but I have not been able to obtain its position, so I have made the position the dog goes to random
            */
           try{

            let radians = -player.getHeading()*Math.PI/180;
            let nx = player.position.x + (misc.getRandom(15,25) * Math.sin(radians));
            let ny = player.position.y + (misc.getRandom(15,25) * Math.cos(radians));
            let z = mp.game.gameplay.getGroundZFor3dCoord(player.position.x, player.position.y, player.position.z, parseFloat(0), false);

            const ballPos = new mp.Vector3(nx, ny, z);
            pet.gettingBall = true;
            freezePet(pet, false);
            ballThrown = true;
            pet.taskGoToCoordAndAimAtHatedEntitiesNearCoord(ballPos.x, ballPos.y, ballPos.z+0.4, ballPos.x, ballPos.y, ballPos.z+0.4, 3, false, parseFloat(0), parseFloat(0), false, 0, false, mp.game.joaat('a_c_chop'));
            //Come back to the owner
            let dist = mp.game.gameplay.getDistanceBetweenCoords(nx, ny, z, player.position.x, player.position.y, player.position.z, true);
            let time = ((dist / 29)*10000)-3000;
            setTimeout(() => {
                 pet.gettingBall = false;
             }, time)       
           } catch(error){
                mp.gui.chat.push(`${error}`);
           }
                
        }
        else mp.game.ui.notifications.showWithPicture("Mascota", "", "Primero debes tirar la pelota", "CHAR_CHOP", 7, true);     
    }
}

//Function to sit down/get up pet
function sitPet(pet, msg=true) {
    if(pet){
        pet.sit = !pet.sit;
        if(pet.sit){
            mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@world_dog_sitting@base");
            pet.taskPlayAnim("creatures@rottweiler@amb@world_dog_sitting@base", "base", 1, 1.0, -1, 1, 1.0, false, false, false);
            if(msg) mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota se ha sentado", "CHAR_CHOP", 7, true);
        }
        else {
            mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@world_dog_sitting@exit");
            pet.taskPlayAnim("creatures@rottweiler@amb@world_dog_sitting@exit", "exit", 1, 1.0, -1, 0, 1.0, false, false, false);
            if(msg) mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota se ha levantado", "CHAR_CHOP", 7, true);
        }
    }
}

//Function to sleep/wake up pet
function sleepPet(pet, msg=true) {
    if(pet){
        pet.sleep = !pet.sleep;
        if(pet.sleep){
            mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@sleep_in_kennel@");
            pet.taskPlayAnim("creatures@rottweiler@amb@sleep_in_kennel@", "sleep_in_kennel", 1, 1.0, -1, 1, 1.0, false, false, false);
            if(msg) mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota se ha dormido", "CHAR_CHOP", 7, true);
        }
        else {
            mp.game.streaming.requestAnimDict("creatures@rottweiler@amb@world_dog_sitting@exit");
            pet.taskPlayAnim("creatures@rottweiler@amb@world_dog_sitting@exit", "exit", 1, 1.0, -1, 0, 1.0, false, false, false);
            if(msg) mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota ha despertado", "CHAR_CHOP", 7, true);
        }
    }
}

//On player press Z key, pet sleeps/wakes up
mp.keys.bind(0x5A, true, function() {
    if(!ped) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Primero debes llamar a tu mascota", "CHAR_CHOP", 7, true);
    const pedPos = new mp.Vector3(ped.getCoords(false).x, ped.getCoords(false).y, ped.getCoords(false).z);
    if(!misc.isInRangeOfPoint(player.position, pedPos, 5)) return mp.game.ui.notifications.showWithPicture("Mascota", "", "No estás lo suficientemente cerca de tu mascota", "CHAR_CHOP", 7, true);
    if(!ped.freeze) return mp.game.ui.notifications.showWithPicture("Mascota", "", "No puedes dar ordenes a tu mascota mientras está en movimiento", "CHAR_CHOP", 7, true);
    //if pet is sitted we update the state
    if(ped.sit) ped.sit = false;
    sleepPet(ped);
});

//On player press B key, pet is sit
mp.keys.bind(0x42, true, function() {
    if(!ped) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Primero debes llamar a tu mascota", "CHAR_CHOP", 7, true);
    const pedPos = new mp.Vector3(ped.getCoords(false).x, ped.getCoords(false).y, ped.getCoords(false).z);
    if(!misc.isInRangeOfPoint(player.position, pedPos, 5)) return mp.game.ui.notifications.showWithPicture("Mascota", "", "No estás lo suficientemente cerca de tu mascota", "CHAR_CHOP", 7, true);
    if(ped.sleep) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota está dormida, debes despertarla primero", "CHAR_CHOP", 7, true);
    if(!ped.freeze) return mp.game.ui.notifications.showWithPicture("Mascota", "", "No puedes dar ordenes a tu mascota mientras está en movimiento", "CHAR_CHOP", 7, true);
    findBall(ped);
});

//On player press K key, pet is sit
mp.keys.bind(0x4B, true, function() {
    if(!ped) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Primero debes llamar a tu mascota", "CHAR_CHOP", 7, true);
    const pedPos = new mp.Vector3(ped.getCoords(false).x, ped.getCoords(false).y, ped.getCoords(false).z);
    if(!misc.isInRangeOfPoint(player.position, pedPos, 5)) return mp.game.ui.notifications.showWithPicture("Mascota", "", "No estás lo suficientemente cerca de tu mascota", "CHAR_CHOP", 7, true);
    if(ped.sleep) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota está dormida, debes despertarla primero", "CHAR_CHOP", 7, true);
    if(!ped.freeze) return mp.game.ui.notifications.showWithPicture("Mascota", "", "No puedes dar ordenes a tu mascota mientras está en movimiento", "CHAR_CHOP", 7, true);
    sitPet(ped);
});

//On player press C key, pet is called
mp.keys.bind(0x43, true, function() {   
    if(ped) {
        mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota vuelve a casa", "CHAR_CHOP", 7, true);
        ped.destroy();
        ped = false;
    }
    else {
        const pGround = mp.game.gameplay.getGroundZFor3dCoord(player.position.x, player.position.y, player.position.z, parseFloat(0), false);
        const pedPos = new mp.Vector3(player.position.x+1, player.position.y, pGround+0.4);
        ped = mp.peds.new(mp.game.joaat('a_c_rottweiler'), pedPos, 0, (ped) => {
            ped.setAlpha(255);
            ped.freezePosition(true);
            ped.freeze = true; //pet state
            ped.sit = false; //pet state
            ped.sleep = false; //pet state
            ped.gettingBall = false; //pet state
            ped.setCanBeDamaged(true);
            ped.setInvincible(false);
            ped.setOnlyDamagedByPlayer(true);
            ped.setProofs(false, false, false, false, false, false, false, false);
        }, player.dimension);
        mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota ha acudido a tu posición", "CHAR_CHOP", 7, true);
        mp.events.callRemote('pet:call');
    }
});

//On player press F key, pet set enabled/disabled following
mp.keys.bind(0x46, true, function() {
    if(!ped) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Primero debes llamar a tu mascota", "CHAR_CHOP", 7, true);
    const pedPos = new mp.Vector3(ped.getCoords(false).x, ped.getCoords(false).y, ped.getCoords(false).z);
    if(misc.isInRangeOfPoint(player.position, pedPos, 1.5)) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Estás demasiado cerca de tu mascota, aléjate un poco más", "CHAR_CHOP", 7, true);
    if(!misc.isInRangeOfPoint(player.position, pedPos, 7)) return mp.game.ui.notifications.showWithPicture("Mascota", "", "No estás lo suficientemente cerca de tu mascota", "CHAR_CHOP", 7, true);
    if(ped.sleep) return mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota está dormida, debes despertarla primero", "CHAR_CHOP", 7, true);
    ped.freeze = !ped.freeze;
    ped.freezePosition(ped.freeze);
    ped.sit = false;
    if(!ped.freeze) mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota empieza a seguirte", "CHAR_CHOP", 7, true);
    else {
        mp.game.ui.notifications.showWithPicture("Mascota", "", "Tu mascota deja de seguirte", "CHAR_CHOP", 7, true);
        freezePet(ped, true);
    }
});

//Check on every tick
mp.events.add('render', () => {
    if(ped && !ped.freeze && !ped.gettingBall){
        let pedPos = new mp.Vector3(ped.getCoords(false).x, ped.getCoords(false).y, ped.getCoords(false).z);
        if(misc.isInRangeOfPoint(player.position, pedPos, 1.5)){
            freezePet(ped, true);
            if(ballThrown) mp.events.callRemote('pet:getBall');
        }
        else {
            //if we get too far from the pet, it stops and waits for us sitting down
            if(!misc.isInRangeOfPoint(player.position, pedPos, 25)){
                mp.game.ui.notifications.showWithPicture("Mascota", "", "Te alejaste demasiado de tu mascota y no puede encontrarte. Te espera sentado, búscalo", "CHAR_CHOP", 7, true);
                freezePet(ped, true);
                sitPet(ped, false);
            } else {
                const pGround = mp.game.gameplay.getGroundZFor3dCoord(player.position.x, player.position.y, player.position.z, parseFloat(0), false);
                //We calculate dog's spped depending on the distance between the player
                let speed;
                if(!misc.isInRangeOfPoint(player.position, pedPos, 4)) speed = 3;
                else speed = 1;
                ped.taskGoToCoordAndAimAtHatedEntitiesNearCoord(player.position.x, player.position.y, pGround+0.4, player.position.x, player.position.y, pGround+0.4, speed, false, parseFloat(0), parseFloat(0), false, 0, false, mp.game.joaat('a_c_chop'));
            }
        }
    }
});