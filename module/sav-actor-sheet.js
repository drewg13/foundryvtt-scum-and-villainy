
import { SaVSheet } from "./sav-sheet.js";
import {onManageActiveEffect, prepareActiveEffectCategories} from "./effects.js";
import { lifestyleRollPopup } from "./sav-roll.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {SaVSheet}
 */
export class SaVActorSheet extends SaVSheet {

  /** @override */
  static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: [ "scum-and-villainy", "sheet", "actor" ],
  	  template: "systems/scum-and-villainy/templates/actor-sheet.html",
      width: 800,
      height: 970,
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}],
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

    // Prepare active effects
    sheetData.effects = prepareActiveEffectCategories( this.document.effects );

    let ship_actors = this.actor.getFlag("scum-and-villainy", "ship") || [];
    let actor = game.actors.get( ship_actors[0]?._id );

    // If assigned ship no longer exists, remove from flags
    if( actor === undefined ) { this.actor.setFlag("scum-and-villainy", "ship", ""); }


    // Encumbrance Levels
    let load_level = [ "BITD.Empty","BITD.Light","BITD.Light","BITD.Light","BITD.Normal","BITD.Normal","BITD.Heavy","BITD.Heavy", "BITD.Heavy","BITD.OverMax","BITD.OverMax" ];
    let mule_level = [ "BITD.Empty","BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Normal","BITD.Normal","BITD.Heavy","BITD.Heavy", "BITD.Heavy","BITD.OverMax" ];

	  //look for abilities in assigned ship flags and set actor results

	  if ( actor?.system.installs.loaded_inst === 1 ) {
	    sheetData.system.loadout.heavy++;
      sheetData.system.loadout.normal++;
      sheetData.system.loadout.light++;
    } else {
      sheetData.system.loadout.heavy = sheetData.system.loadout.heavy_default;
      sheetData.system.loadout.normal = sheetData.system.loadout.normal_default;
      sheetData.system.loadout.light = sheetData.system.loadout.light_default;
	  }

	  if ( actor?.system.installs.stress_max_up === 1 ) {
      sheetData.system.stress.max++;
    } else {
      sheetData.system.stress.max = sheetData.system.stress.max_default;
  	}

	  if ( actor?.system.installs.trauma_max_up === 1 ) {
      sheetData.system.trauma.max++;
    } else {
      sheetData.system.trauma.max = sheetData.system.trauma.max_default;
  	}

	  if ( actor?.system.installs.stun_inst === 1 ) {
      sheetData.system.stun_weapons = 1;
	  } else {
      sheetData.system.stun_weapons = 0;
	  }

	  if ( actor?.system.installs.forged_inst === 1 ) {
      sheetData.system.forged = 1;
	  } else {
      sheetData.system.forged = 0;
	  }

	  //set encumbrance level
    if ( sheetData.system.loadout.heavy > sheetData.system.loadout.heavy_default ) {
      sheetData.system.loadout.load_level = mule_level[ sheetData.system.loadout.current ];
    } else {
      sheetData.system.loadout.load_level = load_level[ sheetData.system.loadout.current ];
    }

	  if ( parseInt(sheetData.system.loadout.planned) < sheetData.system.loadout.current ) {
      sheetData.system.loadout.load_level = "BITD.OverMax";
	  }

    sheetData.system.description = await TextEditor.enrichHTML(sheetData.system.description, {secrets: sheetData.owner, async: true});

    return sheetData;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners( html );

    // Everything below here is only needed if the sheet is editable
    if ( !this.options.editable ) return;

    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(element.data("itemId"));
      item?.sheet.render(true);
    });

    // Post item to chat
    html.find(".item-post").click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      await item?.sendToChat();
    });

	  // Update Ship
    html.find('.ship-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const actor = game.actors.get(element.data("itemId"));
      actor?.sheet.render(true);
    });

    // Lifestyle Roll
    html.find('.lifestyle').click( async (ev) => {
      const element = $(ev.currentTarget);
      const coins = element.data("rollValue");
      await lifestyleRollPopup( coins );
    });

	  // Render XP Triggers sheet
    html.find('.xp-triggers').click(ev => {
      let itemId = this.actor.items.filter( i => i.type === "class" )[0]?.id;
      let item = this.actor.items.get(itemId);
      item?.sheet.render(true, {"renderContext": "xp"});
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });

	  // Clear Flag
	  html.find('.flag-delete').click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.setFlag("scum-and-villainy", element.data("itemType"), "");
      element.slideUp(200, () => this.render(false));
	  });

    // manage active effects
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
	}

  /* -------------------------------------------- */

}
