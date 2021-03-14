
import { SaVSheet } from "./sav-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {SaVSheet}
 */
export class SaVActorSheet extends SaVSheet {

  /** @override */
	static get defaultOptions() {
    //update to foundry.utils.mergeObject
    if( game.majorVersion > 7 ) {
		  return mergeObject(super.defaultOptions, {
  	    classes: ["scum-and-villainy", "sheet", "actor"],
  	    template: "systems/scum-and-villainy/templates/actor-sheet.html",
        width: 800,
        height: 970,
        tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}],
	      scrollY: [".description"]
      });
	  } else {
			return mergeObject(super.defaultOptions, {
  	    classes: ["scum-and-villainy", "sheet", "actor"],
  	    template: "systems/scum-and-villainy/templates/actor-sheet-7.html",
        width: 800,
        height: 970,
        tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}],
	      scrollY: [".description"]
      });
		};
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
	  data.isGM = game.user.isGM;
    data.editable = data.options.editable;

    let actorData = {};
		let actor_flags = [];

		if( game.majorVersion > 7 ) {
      actorData = data.data.data;
			actor_flags = this.document.getFlag("scum-and-villainy", "ship") || [];
	  } else {
      actorData = data.data;
			actor_flags = this.actor.getFlag("scum-and-villainy", "ship") || [];
		};

    // Calculate Load
    let loadout = 0;
    data.items.forEach(i => {loadout += (i.type === "item") ? parseInt(i.data.load) : 0});
    actorData.loadout.current = loadout;


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
        actorData.loadout.heavy++;
		    actorData.loadout.normal++;
		    actorData.loadout.light++;
      } else {
		    actorData.loadout.heavy = actorData.loadout.heavy_default;
		    actorData.loadout.normal = actorData.loadout.normal_default;
		    actorData.loadout.light = actorData.loadout.light_default;
	    };

	  if (i.data.installs.stress_max_up == "1") {
      actorData.stress.max++;
    } else {
		  actorData.stress.max = actorData.stress.max_default;
	  };

	  if (i.data.installs.trauma_max_up == "1") {
      actorData.trauma.max++;
    } else {
		  actorData.trauma.max = actorData.trauma.max_default;
	  };

	  if (i.data.installs.stun_inst == "1") {
      actorData.stun_weapons = 1;
	  } else {
		  actorData.stun_weapons = 0;
	  };

	  if (i.data.installs.forged_inst == "1") {
      actorData.forged = 1;
	  } else {
		  actorData.forged = 0;
	  };
  });

	//set encumbrance level
  if (actorData.loadout.heavy == 9) {
    actorData.loadout.load_level=mule_level[actorData.loadout.current];
  } else {
    actorData.loadout.load_level=load_level[actorData.loadout.current];
  };

	if (actorData.loadout.planned < loadout) {
		actorData.loadout.load_level = "over max";
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
      let item = {};
			if( game.majorVersion > 7 ) {
			  item = this.document.items.get(element.data("itemId"));
		  } else {
				item = this.actor.getOwnedItem(element.data("itemId"));
			};
      item.sheet.render(true);
    });

	// Update Ship
    html.find('.ship-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const actor = game.actors.get(element.data("itemId"));
      //console.log(element.data("itemId"));
      actor.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
			//console.log(this.document);
      if( game.majorVersion > 7 ) {
			  this.document.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
		  } else {
			  this.actor.deleteOwnedItem(element.data("itemId"));
		  };
      element.slideUp(200, () => this.render(false));
    });

	  // Clear Flag
	  html.find('.flag-delete').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      if( game.majorVersion > 7 ) {
			  this.document.setFlag("scum-and-villainy", element.data("itemType"), "");
		  } else {
				this.actor.setFlag("scum-and-villainy", element.data("itemType"), "");
			};
      element.slideUp(200, () => this.render(false));
    });

  }

  /* -------------------------------------------- */

}
