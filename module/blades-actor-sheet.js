
import { BladesSheet } from "./blades-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesActorSheet extends BladesSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["scum-and-villainy", "sheet", "actor"],
  	  template: "systems/scum-and-villainy/templates/actor-sheet.html",
      width: 700,
      height: 970,
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
	let actor_flags = this.actor.getFlag("scum-and-villainy", "ship") || [];
	
    // Calculate Load
    let loadout = 0;
    data.items.forEach(i => {loadout += (i.type === "item") ? parseInt(i.data.load) : 0});
    data.data.loadout = loadout;
    
    // Encumbrance Levels
    let load_level=["light","light","light","light","normal","normal","heavy","heavy",
			"heavy","over max"];
    let mule_level=["light","light","light","light","light","normal","normal",
			"heavy","heavy","heavy","over max"];
    let mule_present = 0;
 
    //Sanity Check
    if (loadout < 0) {
      loadout = 0;
    }
    if (loadout > 9) {
      loadout = 9;
    }

    //look for Loaded ability on assigned ship in flags
    actor_flags.forEach(i => {
      if (i.data.installs.loaded_inst == "1") {
        mule_present = 1;
      }
    });

    //set encumbrance level
    if (mule_present) {
      data.data.load_level=mule_level[loadout];
    } else {
      data.data.load_level=load_level[loadout];   
    }

	//look for Thrillseekers/Smooth Criminals ability on assigned ship in flags
    let stress_max_up = 0;
	actor_flags.forEach(i => {
      if (i.data.installs.stress_max_up == "1") {
        stress_max_up = 1;
      }
    });

	if (stress_max_up == 1) {
      data.data.stress.max++;
    } else {
      data.data.stress.max = data.data.stress.max_default;   
    }

	//look for Driven ability on assigned ship in flags
    let trauma_max_up = 0;
	actor_flags.forEach(i => {
      if (i.data.installs.trauma_max_up == "1") {
        trauma_max_up = 1;
      }
    });

	if (trauma_max_up == 1) {
      data.data.trauma.max++;
    } else {
      data.data.trauma.max = data.data.trauma.max_default;   
    }

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(element.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(element.data("itemId"));
      element.slideUp(200, () => this.render(false));
    });
	
	// Clear Flag
	html.find('.flag-delete').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      this.actor.setFlag("scum-and-villainy", element.data("itemType"), "");
      element.slideUp(200, () => this.render(false));
    });
	
  }

  /* -------------------------------------------- */

}
