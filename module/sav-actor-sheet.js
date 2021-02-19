
import { SaVSheet } from "./sav-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {SaVSheet}
 */
export class SaVActorSheet extends SaVSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["scum-and-villainy", "sheet", "actor"],
  	  template: "systems/scum-and-villainy/templates/actor-sheet.html",
      width: 780,
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
	
    
    // Encumbrance Levels
    let load_level=["empty","light","light","light","normal","normal","heavy","heavy",
			"heavy","over max","over max"];
    let mule_level=["empty","light","light","light","light","normal","normal",
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
        data.data.loadout.heavy++;
		data.data.loadout.normal++;
		data.data.loadout.light++;
      } else {
		data.data.loadout.heavy = data.data.loadout.heavy_default;
		data.data.loadout.normal = data.data.loadout.normal_default;
		data.data.loadout.light = data.data.loadout.light_default;
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
	  
	  if (i.data.installs.forged_inst == "1") {
        data.data.forged = 1;
		
	  } else {
		data.data.forged = 0;
		
	  };
    });

	//set encumbrance level
    if (data.data.loadout.heavy == 9) {
      data.data.loadout.load_level=mule_level[data.data.loadout.current];
    } else {
      data.data.loadout.load_level=load_level[data.data.loadout.current];   
    };
		
	if (data.data.loadout.planned < loadout) {
		data.data.loadout.load_level = "over max";
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
