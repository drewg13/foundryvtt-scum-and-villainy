
import { SaVSheet } from "./sav-sheet.js";
import {onManageActiveEffect, prepareActiveEffectCategories} from "./effects.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {SaVSheet}
 */
export class SaVShipSheet extends SaVSheet {

  /** @override */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
	    classes: ["scum-and-villainy", "sheet", "actor"],
	  	template: "systems/scum-and-villainy/templates/ship-sheet.html",
	    width: 720,
	    height: 970,
	    tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}],
		  scrollY: [".description"]
	  });
  }

  /** @override */
  async getData( options ) {
    const superData = super.getData( options );
    const sheetData = superData.data;
    //sheetData.document = superData.actor;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;
    sheetData.isGM = game.user.isGM;

    // Prepare active effects
    sheetData.effects = prepareActiveEffectCategories(this.document.effects);

    sheetData.system.description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(sheetData.system.description, {secrets: sheetData.owner, async: true});

    return sheetData;
  }

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(element.data("itemId"));
      item?.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });

    // Post item to chat
    html.find(".item-post").click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      await item?.sendToChat();
    });

    // Render XP Triggers sheet
    html.find('.xp-triggers').click(ev => {
      let itemId = this.actor.items.filter( i => i.type === "crew_type" )[0]?.id;
	    let item = this.actor.items.get(itemId);
      item?.sheet.render(true, {"renderContext": "xp"});
    });

    // manage active effects
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
	}
  /* -------------------------------------------- */
  /*  Form Submission                             */
  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {

    // Update the Item
    await super._updateObject( event, formData );
    let crew_data = "system.crew";

    if (event.target && event.target.name === crew_data) {
      this.render(true);
    }
  }
  /* -------------------------------------------- */

}
