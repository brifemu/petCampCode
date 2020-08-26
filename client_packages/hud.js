const instructions = require('/better_instructions');

const help = new instructions(-1);

help.addButton('Buscar pelota', 'B');
help.addButton('Dormir/despertar mascota', 'Z');
help.addButton('Sentar/levantar mascota', 'K');
help.addButton('Seguir/dejar de seguir mascota', 'F');
help.addButton('Llamar/guardar mascota', 'C');


help.toggleHud(true);

