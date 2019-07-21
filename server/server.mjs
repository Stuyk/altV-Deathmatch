import * as alt from 'alt';
import * as chat from 'chat';

// Default Spawn Locations
// Based around the Vineyard.
const spawns = [
	{ x: -1854.0791015625, y: 2068.707763671875, z: 141.09521484375 },
	{ x: -1895.88134765625, y: 2040.7252197265625, z: 140.859375 },
	{ x: -1887.217529296875, y: 2089.63525390625, z: 140.994140625 },
	{ x: -1868.3209228515625, y: 2050.404296875, z: 140.977294921875 },
	{ x: -1911.7978515625, y: 2083.134033203125, z: 140.3707275390625 },
	{ x: -1868.017578125, y: 2118.989013671875, z: 132.2828369140625 },
	{ x: -1799.5780029296875, y: 2119.305419921875, z: 133.2601318359375 },
	{ x: -1874.874755859375, y: 1994.822021484375, z: 137.77587890625 },
	{ x: -1908.14501953125, y: 1971.191162109375, z: 146.3524169921875 },
	{ x: -1945.806640625, y: 2014.918701171875, z: 152.3846435546875 }
];

const centerpoint = {x: 0, y: 0, z: 0}

const assaultWeps = [
	584646201, // App Pistol
	3686625920, // Combat MG
	487013001 // Pump Shotgun
]

var assaultSkins = [
	'csb_cop',
	's_m_y_cop_01',
	's_f_y_cop_01'
]

const sniperWeps = [
	-771403250, // Heavy Pistol
	-1121678507, // Mini SMG
	177293209 // Heavy Sniper MK2
]

var sniperSkins = [
	's_m_y_blackops_01',
	's_m_y_blackops_02',
	's_m_y_armymech_01'
]

const strategicWeps = [
	-1063057011, // Special Carbine
	615608432, // Molotov
	2017895192 // Sawnoff
]

var strategicSkins = [
	'ig_casey',
	'mp_s_m_armoured_01',
	's_m_m_armoured_02'
]

const respawnTime = 3500; // 3.5 Seconds

// Events
alt.on('playerDeath', respawnPlayer);
alt.on('playerConnect', (player) => {
	console.log(`${player.name} has joined the game.`);
	chat.broadcast(`${player.name} has joined the game.`);
	alt.emitClient(player, 'chooseClass');

	assaultSkins.forEach((skin) => {
		player.model = skin;
	});

	sniperSkins.forEach((skin) => {
		player.model = skin;
	});

	strategicSkins.forEach((skin) => {
		player.model = skin;
	});
});

// Event Functions
/**
 * @returns a random spawn point from the spawns array.
 */
function getSpawnPoint() {
	return spawns[Math.floor(Math.random() * (spawns.length))];
}

/**
 * Respawn the player when they die.
 * @param player 
 */
function respawnPlayer(player, killer) {
	alt.emitClient(player, 'addDeath');
	alt.emitClient(player, 'showDeathEffects');
	
	// Suicide
	if (player.suicide !== undefined && player.suicide) {
		player.suicide = false;
		setTimeout(() => {
			player.spawn(0, 0, 0, respawnTime);
			alt.emitClient(player, 'chooseClass');
			alt.emitClient(player, 'forceRagdoll');
		}, respawnTime);
	// Normal Death
	} else {
		player.suicide = false;
		setTimeout(() => {
			player.spawn(0, 0, 0, respawnTime);
			alt.emitClient(player, 'chooseClass');
			alt.emitClient(player, 'forceRagdoll');
		}, respawnTime);
	}

	// If the player kills themself, don't worry about it.
	if (player === killer)
		return;

	if (killer === null || player === null)
		return;

	if (killer === undefined || player === undefined)
		return;

	chat.broadcast(`{FFFF00}${player.name}{FFFFFF} was killed by {FF0000}${killer.name}`);
	alt.emitClient(killer, 'addKill');
}

function selectClass(player, type) {
	const newLoc = getSpawnPoint();
	player.class = type;

	alt.emitClient(player, 'clearDeathEffects');
	alt.emitClient(player, 'clearRagdoll', player);

	player.removeAllWeapons();

	var selectedSkin = 0;

	// Force model to load.
	player.spawn(newLoc.x, newLoc.y, newLoc.z, 500);
	
	setTimeout(() => {
		// Select skin.
		switch(player.class) {
			case 'assault':
				selectedSkin = Math.floor(Math.random() * (assaultSkins.length));
				player.model = assaultSkins[selectedSkin];
				break;
			case 'sniper':
				selectedSkin = Math.floor(Math.random() * (sniperSkins.length));
				player.model = sniperSkins[selectedSkin];
				break;
			case 'strategic':
				selectedSkin = Math.floor(Math.random() * (strategicSkins.length));
				player.model = strategicSkins[selectedSkin];
				break;
		}

		// Select Weapons
		switch(type) {
			case 'assault':
				for(let i = 0; i < assaultWeps.length; i++) {
					player.giveWeapon(assaultWeps[i], 999, true);
				}
				break;
			case 'sniper':
				for(let i = 0; i < sniperWeps.length; i++) {
					player.giveWeapon(sniperWeps[i], 999, true);
				}
				break;
			case 'strategic':
				for(let i = 0; i < strategicWeps.length; i++) {
					player.giveWeapon(strategicWeps[i], 999, true);
				}
				break;
		}
	}, 1000);
}

alt.onClient('selectClass', (player, type) => {
	selectClass(player, type);
});

alt.onClient('killSelf', (player) => {
	setTimeout(() => {
		player.health = 0;
		player.suicide = true;
	}, respawnTime);
});

chat.registerCmd('kill', (player) => {
	alt.emitClient(null, 'suicidePlayer', player);
});

chat.registerCmd('pos', (player) => {
	console.log(player.pos);
});

chat.registerCmd('players', (player) => {
	chat.send(player, `Players: ${alt.Player.all.length}`)
});

setInterval(() => {
	alt.Player.all.forEach((player) => {
		player.setDateTime(12, 12, 2019, 12, 0, 0);
		player.setWeather(2);
	});
}, 5000);