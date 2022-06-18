/**
 * Extend the basic ItemSheet
 * @extends {ItemSheet}
 */

import {onManageActiveEffect, prepareActiveEffectCategories} from "./effects.js";

export class SaVItemSheet extends ItemSheet {

  /** @override */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["scum-and-villainy", "sheet", "item"],
			width: 900,
			height: 'auto',
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
		});
  }

  /* -------------------------------------------- */

/** @override */
  async getData(options) {
    const superData = super.getData( options );
    const sheetData = superData.data;

    sheetData.isGM = game.user.isGM;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;

    // Prepare Active Effects
    sheetData.effects = prepareActiveEffectCategories(this.document.effects);
    sheetData.system.notables = await TextEditor.enrichHTML(sheetData.system.notables, {secrets: sheetData.owner, async: true});
    sheetData.system.description = await TextEditor.enrichHTML(sheetData.system.description, {secrets: sheetData.owner, async: true});

		return sheetData;
  }

  /** @override */
  get template() {
    const path = "systems/scum-and-villainy/templates/items";
    let simple_item_types = ["background", "heritage", "vice", "crew_reputation", "ship_size"];
    let template_name = `${this.item.type}`;

    if (simple_item_types.indexOf(this.item.type) >= 0) {
      template_name = "simple";
    }

		return `${path}/${template_name}.html`;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find(".effect-control").click(ev => {
      if ( this.item.isOwned ) return ui.notifications.warn(game.i18n.localize("BITD.EffectWarning"))
      onManageActiveEffect(ev, this.item)
    });
  }

  /* -------------------------------------------- */
}
