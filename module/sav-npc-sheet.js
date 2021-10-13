
import { SaVSheet } from "./sav-sheet.js";
import { SaVHelpers } from "./sav-helpers.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {SaVSheet}
 */
export class SaVNPCSheet extends SaVSheet {

  /** @override */
  static get defaultOptions() {
    //update to foundry.utils.mergeObject
		return mergeObject(super.defaultOptions, {
  	  classes: [ "scum-and-villainy", "sheet", "actor" ],
  	  template: "systems/scum-and-villainy/templates/npc-sheet.html",
      width: 800,
      height: 970,
	    scrollY: [".description"]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.isGM = game.user.isGM;
    data.editable = data.options.editable;
    const actorData = data.data;

    if( game.majorVersion > 7 ) {
      data.actor = actorData;
      data.data = actorData.data;
    }
    data.size_list = SaVHelpers.createListOfClockSizes( game.system.savclocks.sizes, parseInt( data.data.goal_clock.max ), parseInt( data.data.goal_clock.max ) );

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners( html );

    // Everything below here is only needed if the sheet is editable
    if ( !this.options.editable ) return;

	}

  /* -------------------------------------------- */

}
