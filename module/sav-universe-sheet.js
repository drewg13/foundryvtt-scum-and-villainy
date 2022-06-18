
import { SaVSheet } from "./sav-sheet.js";

/**
 * @extends {SaVSheet}
 */
export class SaVUniverseSheet extends SaVSheet {

  /** @override */
	static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: ["scum-and-villainy", "sheet", "actor"],
  	  template: "systems/scum-and-villainy/templates/universe-sheet.html",
      width: 800,
      height: 'auto',
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content"}]
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

    sheetData.system.description = await TextEditor.enrichHTML(sheetData.system.description, {secrets: sheetData.owner, async: true});

    let total = 0;
    sheetData.items.forEach( i => { if( i.type === "star_system" ){ total += 1 } } );
    sheetData.totalSystems = total;

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
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
			await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
      element.slideUp(200, () => this.render(false));
    });

    // Post item to chat
    html.find(".item-post").click((ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sendToChat();
    });

    // Modify player visibility
    html.find(".item-visible").click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      const itemVisible = !item.data.data.visible;
      await this.actor.updateEmbeddedDocuments("Item", [{ _id: item.id, system:{visible: itemVisible}}]);
    });

    // Roll on Wanted Table
    html.find('.wanted').click( async (ev) => {
      const element = $(ev.currentTarget);
      const value = element.data("value");
      let wanted_compendiums = await game.packs.filter( p => ( p.metadata.label === 'Wanted Tables' ) && ( p.documentName === 'RollTable' ) )[0].getDocuments();

      if( value < 4 ){
        let tableName = 'Wanted ' + value.toString();
        let table = wanted_compendiums.filter( p => p.name === tableName )[0];

        if (!table) {
          ui.notifications.warn(`Table ${tableName} not found.`, {});
          return;
        }
        await table.draw();
      } else {
        let tableName = 'Wanted 3';
        let table = wanted_compendiums.filter( p => p.name === tableName )[0];

        if (!table) {
          ui.notifications.warn(`Table ${tableName} not found.`, {});
          return;
        }
        let r = new Roll("6")
        await table.draw({roll: r});
      }
    });
	}
}
