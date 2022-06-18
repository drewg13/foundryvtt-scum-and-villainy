
import { SaVSheet } from "./sav-sheet.js";
import { SaVHelpers } from "./sav-helpers.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {SaVSheet}
 */
export class SaVNPCSheet extends SaVSheet {

  /** @override */
  static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: [ "scum-and-villainy", "sheet", "actor" ],
  	  template: "systems/scum-and-villainy/templates/npc-sheet.html",
      width: 800,
      height: 970,
	    scrollY: [".description"]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const superData = super.getData( options );
    const sheetData = superData.data;
    //sheetData.document = superData.actor;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;
    sheetData.isGM = game.user.isGM;

    sheetData.size_list = SaVHelpers.createListOfClockSizes( game.system.savclocks.sizes, parseInt( sheetData.system.goal_clock.max ), parseInt( sheetData.system.goal_clock.max ) );
    sheetData.system.notes = await TextEditor.enrichHTML(sheetData.system.notes, {secrets: sheetData.owner, async: true});

    return sheetData;
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
