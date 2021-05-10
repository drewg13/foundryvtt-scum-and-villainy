
import { SaVSheet } from "./sav-sheet.js";

/**
 * @extends {SaVSheet}
 */
export class SaVUniverseSheet extends SaVSheet {

  /** @override */
	static get defaultOptions() {
    //update to foundry.utils.mergeObject
    return mergeObject(super.defaultOptions, {
  	  classes: ["scum-and-villainy", "sheet", "actor"],
  	  template: "systems/scum-and-villainy/templates/universe-sheet.html",
      width: 800,
      height: 'auto',
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content"}]
    });
  }

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

	  return data;
  }

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      let item;
			if( game.majorVersion > 7 ) {
			  item = this.document.items.get(element.data("itemId"));
			} else {
				item = this.actor.getOwnedItem(element.data("itemId"));
			}
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
			if( game.majorVersion > 7 ) {
        await this.document.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
			} else {
				await this.actor.deleteOwnedItem(element.data("itemId"));
			}
      element.slideUp(200, () => this.render(false));
    });
	}
}
