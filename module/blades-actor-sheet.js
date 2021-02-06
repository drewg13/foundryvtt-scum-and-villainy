
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
    data.data.loadout.current = loadout;
	var loadout_test = 0;
	if (data.data.loadout.planned < loadout) {
		loadout = 10;
	};
    
    // Encumbrance Levels
    let load_level=["light","light","light","light","normal","normal","heavy","heavy",
			"heavy","over max","over max"];
    let mule_level=["light","light","light","light","light","normal","normal",
			"heavy","heavy","heavy","over max"];
    
 
    //Sanity Check
    if (loadout < 0) {
      loadout = 0;
    };
    if (loadout > 10) {
      loadout = 10;
    };

    

	//look for abilities in assigned ship flags and set actor results
    	
	actor_flags.forEach(i => {
      if (i.data.installs.loaded_inst == "1") {
        data.data.loadout.max++ ;
      } else {
		data.data.loadout.max = data.data.loadout.max_default;
	  };
	  
	  if (i.data.installs.stress_max_up == "1") {
        data.data.stress.max++;
      } else {
		data.data.stress.max = data.data.stress.max_default;
	  };
	  
	  if (i.data.installs.trauma_max_up == "1") {
        data.data.trauma.max++;
      } else {
		data.data.trauma.max = data.data.trauma.max_default;
	  };
	  
	  if (i.data.installs.stun_inst == "1") {
        data.data.stun_weapons = 1;
	  } else {
		data.data.stun_weapons = 0;
	  };
    });

	//set encumbrance level
    if (data.data.loadout.max == 9) {
      data.data.loadout.load_level=mule_level[loadout];
    } else {
      data.data.loadout.load_level=load_level[loadout];   
    };
	
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
	
	// Update Ship
    html.find('.ship-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const actor = game.actors.get(element.data("itemId"));
      actor.sheet.render(true);
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
