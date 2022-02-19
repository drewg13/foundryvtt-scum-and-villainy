
import { SaVSheet } from "./sav-sheet.js";
import { SaVClock } from "./sav-clock.js";

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

    let total = 0;
    data.items.forEach( i => { if( i.type === "star_system" ){ total += 1 } } );
    data.totalSystems = total;
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
			  item = this.actor.items.get(element.data("itemId"));
			} else {
				item = this.actor.getOwnedItem(element.data("itemId"));
			}
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
			if( game.majorVersion > 7 ) {
        await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
			} else {
				await this.actor.deleteOwnedItem(element.data("itemId"));
			}
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
      if( game.majorVersion > 7 ) {
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: item.id, data:{visible: itemVisible}}]);
      } else {
        await this.actor.updateOwnedItem({ _id: item.id, data:{ visible: itemVisible } });
      }
    });

    /** html.find("button[name=minus]").click(async (ev) => {
      ev.preventDefault();
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      let oldClock = new SaVClock(this.system.loadClockFromItem({ item: item }));

      await this.updateClock(oldClock.decrement());
    });

    html.find("button[name=plus]").click(async (ev) => {
      ev.preventDefault();
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      console.log(item);
      let oldClock = new SaVClock(this.system.loadClockFromItem({ item: item }));
      console.log(oldClock);
      await this.updateClock(oldClock.increment());
    }); */

    // Roll on Wanted Table
    html.find('.wanted').click( async (ev) => {
      const element = $(ev.currentTarget);
      const value = element.data("value");
      let wanted_compendiums;
      if( game.majorVersion > 7 ) {
        wanted_compendiums = await game.packs.filter( p => ( p.metadata.label === 'Wanted Tables' ) && ( p.documentName === 'RollTable' ) )[0].getDocuments();
      } else {
        wanted_compendiums = await game.packs.filter( p => ( p.metadata.label === 'Wanted Tables' ) && ( p.entity === 'RollTable' ) )[0].getContent();
      }

      if( value < 4 ){
        let tableName = 'Wanted ' + value.toString();
        let table = wanted_compendiums.filter( p => p.data.name === tableName )[0];

        if (!table) {
          ui.notifications.warn(`Table ${tableName} not found.`, {});
          return;
        }
        await table.draw();
      } else {
        let tableName = 'Wanted 3';
        let table = wanted_compendiums.filter( p => p.data.name === tableName )[0];

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
