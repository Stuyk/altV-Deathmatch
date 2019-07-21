import * as alt from 'alt';
import * as native from 'natives';

var isMenuOpen = false;
var currentClass = 'assault';
var totalDeaths = 0;
var totalKills = 0;
const classOptions = [];

// Load mp_suicide library.
if (!native.hasAnimDictLoaded('mp_suicide')) {
	native.requestAnimDict('mp_suicide');
}
	
class ClassOption {
	constructor(text, x, y, width, height, event, classType, textDict, textName) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.event = event;
		this.text = text;
		this.classType = classType;
		this.textDict = textDict;
		this.textName = textName;
	}

	render() {
		// isHovered
		if (this.isMouseHovered(this.x, this.y, this.width, this.height)) {
			// Hover sound.
			if (!this.playedHoverSound) {
				this.playedHoverSound = true;
				native.playSoundFrontend(-1,  'NAV_UP_DOWN', 'HUD_FREEMODE_SOUNDSET', true);
			}
			
			native.drawRect(this.x, this.y, this.width, this.height, 0, 180, 0, 50);
			drawText(this.text, this.x, this.y + (this.height / 4), 0.5, 255, 255, 255, 150);
			drawSprite(this.textDict, this.textName, this.x, this.y, 0.05, 0.09, 255);

			// Click function.
			if (!native.isDisabledControlJustPressed(0, 24))
				return;

			// Close menu / emit function.
			isMenuOpen = false;
			native.playSoundFrontend(-1,  'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true);
			alt.emit(this.event, this.classType);
			native.transitionFromBlurred(500);
			return;
		}

		// isNotHovered
		this.playedHoverSound = false;
		native.drawRect(this.x, this.y, this.width, this.height, 0, 0, 0, 150);
		drawText(this.text, this.x, this.y + (this.height / 4), 0.5, 255, 255, 255, 100);
		drawSprite(this.textDict, this.textName, this.x, this.y, 0.05, 0.09, 100);
	}

	isMouseHovered(xPos, yPos, width, height) {
		const cursorPos = {
			x: native.getControlNormal(0, 239),
			y: native.getControlNormal(0, 240)
		}
	
		if (cursorPos.x < xPos - (width / 2))
			return false;
	
		if (cursorPos.x > xPos + (width / 2))
			return false;
	
		if (cursorPos.y < yPos - (height / 2))
			return false;
	
		if (cursorPos.y > yPos + (height / 2))
			return false;
	
		return true;
	}
}

// Initialize Class Options
classOptions.push(new ClassOption('Assault Class', 0.2, 0.3, 0.2, 0.5, 'selectClass', 'assault', 'mpmissmarkers256', 'arm_wrestling_icon'));
classOptions.push(new ClassOption('Sniper Class', 0.5, 0.3, 0.2, 0.5, 'selectClass', 'sniper', 'mpmissmarkers256', 'capture_the_flag_icon'));
classOptions.push(new ClassOption('Strategic Class', 0.8, 0.3, 0.2, 0.5, 'selectClass', 'strategic', 'mpmissmarkers256', 'deathmatch_marker_256'));

// X is used to toggle the class menu.
alt.on('keydown', (key) => {
	// On key press.
	if (key === 'X'.charCodeAt(0)) {
		isMenuOpen = !isMenuOpen;

		if (!isMenuOpen) {
			native.displayRadar(true);
			native.transitionFromBlurred(500);
		} else {
			native.transitionToBlurred(500);
		}
	}
});

// Calls constantly.
alt.on('update', () => {
	native.restorePlayerStamina(alt.Player.local.scriptID, 100);

	// If the menu is not open, enable the controls.
	if (!isMenuOpen) {
		native.enableAllControlActions(0);
		native.transitionFromBlurred(500);
		native.showHudComponentThisFrame(14);

		drawText('X to Select Class'.toUpperCase(), 0.90, 0.1, 0.5, 255, 255, 255, 175);
		drawText(`Current Class: ${currentClass}`.toUpperCase(), 0.90, 0.15, 0.5, 255, 255, 255, 175);
		drawText(`Kills: ${totalKills}`.toUpperCase(), 0.90, 0.20, 0.5, 255, 255, 255, 175);
		drawText(`Deaths: ${totalDeaths}`.toUpperCase(), 0.90, 0.25, 0.5, 255, 255, 255, 175);
	} else {
		// Draw the menu.
		native.showCursorThisFrame();
		native.hideHudAndRadarThisFrame();
		native.disableControlAction(0, 1, true);
		native.disableControlAction(0, 2, true);
		native.disableControlAction(0, 142, true);
		native.disableControlAction(0, 106, true);

		for(var i = 0; i < classOptions.length; i++) {
			classOptions[i].render();
		}
	}
});

alt.on('selectClass', (type) => {
	currentClass = type;
	alt.emitServer('selectClass', type);
});

alt.onServer('chooseClass', () => { 
	isMenuOpen = true;
	native.transitionToBlurred(500);
});

alt.onServer('addKill', () => {
	totalKills += 1;
});

alt.onServer('addDeath', () => {
	totalDeaths += 1;
});

/**
 * Draw text with the update function.
 * @param msg 
 * @param x 
 * @param y 
 * @param scale 
 * @param r 
 * @param g 
 * @param b 
 * @param a 
 */
function drawText(msg, x, y, scale, r, g, b, a) {
	native.setUiLayer(50);
	native.beginTextCommandDisplayText('STRING');
	native.addTextComponentSubstringPlayerName(msg);
	native.setTextFont(4);
	native.setTextScale(1, scale);
	native.setTextWrap(0.0, 1.0);
	native.setTextCentre(true);
	native.setTextColour(r, g, b, a);
	native.setTextOutline();
	native.endTextCommandDisplayText(x, y)
}

/**
 * Load a sprite and draw it with the update event.
 * @param dict 
 * @param name 
 * @param x 
 * @param y 
 * @param width 
 * @param height 
 * @param alpha 
 */
function drawSprite(dict, name, x, y, width, height, alpha) {
	if (!native.hasStreamedTextureDictLoaded(dict)) {
		native.requestStreamedTextureDict(dict, false);
		return;
	}
		
	native.setUiLayer(99);
	native.drawSprite(dict, name, x, y, width, height, 0, 255, 255, 255, alpha);
}

alt.onServer('suicidePlayer', (player) => {
	native.giveWeaponToPed(player.scriptID, 453432689, 1, false, true);
  
	alt.setTimeout(() => {
		native.taskPlayAnim(player.scriptID, 'mp_suicide', 'pistol', 8.0, 1.0, -1, 2, 0, 0, 0, 0);
	}, 500);
  
	alt.setTimeout(() => {
		native.setPedShootsAtCoord(player.scriptID, 0, 0, 0, true);

		if (player.scriptID !== alt.Player.local.scriptID)
			return;

		native.startScreenEffect('DeathFailNeutralIn', -1, true);
		alt.emitServer('killSelf');
	}, 1250);
});

alt.onServer('showDeathEffects', () => {
	native.startScreenEffect('DeathFailNeutralIn', -1, true);
});

alt.onServer('forceRagdoll', () => {
	alt.setTimeout(() => {
		native.freezeEntityPosition(alt.Player.local.scriptID, true);
	}, 250);
});

alt.onServer('clearRagdoll', () => {
	native.freezeEntityPosition(alt.Player.local.scriptID, false);
});

alt.onServer('clearDeathEffects', () => {
	native.stopAllScreenEffects();
});