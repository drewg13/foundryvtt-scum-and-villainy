/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class BladesSheet extends ActorSheet {

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-add-popup").click(this._onItemAddClick.bind(this));
	html.find(".flag-add-popup").click(this._onFlagAddClick.bind(this));
	html.find(".update-sheet").click(this._onUpdateClick.bind(this));
	html.find(".update-box").click(this._onUpdateBoxClick.bind(this));
	html.find(".roll-die-attribute").click(this._onRollAttributeDieClick.bind(this));
	
	
	
    // This is a workaround until is being fixed in FoundryVTT.
    if ( this.options.submitOnChange ) {
      html.on("change", "textarea", this._onChangeInput.bind(this));  // Use delegated listener on the form
    }

    
  }

  /* -------------------------------------------- */

  async _onItemAddClick(event) {
    event.preventDefault();
	const item_type = $(event.currentTarget).data("itemType")
	const limiter = $(event.currentTarget).data("limiter")
    const distinct = $(event.currentTarget).data("distinct")
    let input_type = "checkbox";

    if (typeof distinct !== "undefined") {
      input_type = "radio";
    }

		
	let items = await BladesHelpers.getAllItemsByType(item_type, game);
	
    let html = `<div id="items-to-add">`;

	let actor_flags = this.actor.getFlag("scum-and-villainy", "ship") || [];
	var stun_weapons = 0;
	actor_flags.forEach(i => {
      if (i.data.installs.stun_inst == "1") {
        stun_weapons = 1;
      } else {
		stun_weapons = 0;
	  };
	});
	
	if ( this.actor.data.type == "ship" ) {
		var main_systems = ["Engines", "Hull", "Comms", "Weapons"];
		var overloaded = new Object;
		main_systems.forEach( m => {
		
			let actor_items = this.actor.data.items.filter(i => i.data.class === m);
			let total = actor_items.length;
		
			if ( total >= eval( "this.actor.data.data.systems." + m.toLowerCase() + ".value" )) {
				overloaded[m] = 1;

			} else {
				overloaded[m] = 0;

			};
		});
	};
	

    items.forEach(e => {
      let addition_price_load = ``;
      
      if (typeof e.data.load !== "undefined") {
        addition_price_load += `(${e.data.load})`
      } else if (typeof e.data.price !== "undefined") {
        addition_price_load += `(${e.data.price})`
      }
	  
	  	  
	  var nonclass_upgrades = ["Auxiliary", "Gear", "Training", "Upgrades"];
	  if (e.type == "crew_upgrade") {
		if ( ( ( main_systems.includes( e.data.class ) ) && ( overloaded[ ( e.data.class.charAt(0).toUpperCase() + e.data.class.slice(1) ) ] == 0 ) ) || ( nonclass_upgrades.includes(e.data.class) ) || ( e.data.class == this.actor.data.data.ship_class ) ) {
			html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
			html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
			html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(e.data.description)}</span></i>`;
			html += `</label>`;
		};
	  } else if (e.type == "crew_ability") {
		  if (e.data.class == this.actor.data.data.ship_class) {
			html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
			html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
			html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(e.data.description)}</span></i>`;
			html += `</label>`;
		  };
	  } else if (e.type == "ability") {
		  if (e.data.class == this.actor.data.data.character_class) {
			html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
			html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
			html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(e.data.description)}</span></i>`;
			html += `</label>`;
		  };
	  } else if (e.type == "item") {
		  if ((e.data.class == "Standard") || ((stun_weapons == 1) && (e.data.class == "Non-Lethal")) || (e.data.class == this.actor.data.data.character_class)) {
			html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
			html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
			html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(e.data.description)}</span></i>`;
			html += `</label>`;
		  };
	  } else {
			html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
			html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
			html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(e.data.description)}</span></i>`;
			html += `</label>`;
	  };
    });

    html += `</div>`;

    let options = {
      // width: "500"
    }
    
    let dialog = new Dialog({
      title: `${game.i18n.localize('BITD.Add')} ${item_type}`,
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('BITD.Add'),
          callback: () => this.addItemsToSheet(item_type, $(document).find('#items-to-add'))
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('BITD.Cancel'),
          callback: () => false
        }
      },
      default: "two"
    }, options);

    dialog.render(true);
  }

async _onFlagAddClick(event) {
    event.preventDefault();
	const item_type = $(event.currentTarget).data("itemType")
	const limiter = $(event.currentTarget).data("limiter")
    const distinct = $(event.currentTarget).data("distinct")
    let input_type = "checkbox";

    if (typeof distinct !== "undefined") {
      input_type = "radio";
    }

		
	let items = await BladesHelpers.getAllActorsByType(item_type, game);
	
    let html = `<div id="items-to-add">`;

    items.forEach(e => {
	  if (e.type === item_type) {
	  html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
      html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
      html += `${game.i18n.localize(e.name)} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(e.data.designation)}</span></i>`;
      html += `</label>`;
	  }
    });

    html += `</div>`;

    let options = {
      // width: "500"
    }
    
    let dialog = new Dialog({
      title: `${game.i18n.localize('BITD.Add')} ${item_type}`,
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('BITD.Add'),
          callback: () => this.addFlagsToSheet(item_type, $(document).find('#items-to-add'))
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('BITD.Cancel'),
          callback: () => false
        }
      },
      default: "two"
    }, options);

    dialog.render(true);
  }

  
  /* -------------------------------------------- */

  async addItemsToSheet(item_type, el) {

    
	let items = await BladesHelpers.getAllItemsByType(item_type, game);
	let items_to_add = [];
    el.find("input:checked").each(function() {


		items_to_add.push(items.find(e => e._id === $(this).val()));
	
	  
    });
    this.actor.createEmbeddedEntity("OwnedItem", items_to_add);
  }
 
  async addFlagsToSheet(item_type, el) {

    
	let items = await BladesHelpers.getAllActorsByType(item_type, game);
	let items_to_add = [];
    el.find("input:checked").each(function() {

	
		items_to_add.push(items.find(e => e._id === $(this).val()));
	
	  
    });
    await this.actor.setFlag("scum-and-villainy", item_type, items_to_add);
  }



  /* -------------------------------------------- */

  /**
   * Roll an Attribute die.
   * @param {*} event 
   */
  async _onRollAttributeDieClick(event) {

    const attribute_name = $(event.currentTarget).data("rollAttribute");
    this.actor.rollAttributePopup(attribute_name);

  }

  /* -------------------------------------------- */
  async _onUpdateClick(event) {
	event.preventDefault();
	const item_type = $(event.currentTarget).data("itemType");
	const limiter = $(event.currentTarget).data("limiter");
    
	
	//find all items of type in world	
	const world_items = await BladesHelpers.getAllItemsByType(item_type, game);
	//console.log(world_items);
	//find all items of type attached to actor
	const curr_items = this.actor.data.items.filter(i => i.type === item_type);
	//console.log("Current");
	//console.log(curr_items);
	//find all items in world, but not attached to actor
	const add_items = world_items.filter(({ name: id1 }) => !curr_items.some(({ name: id2 }) => id2 === id1));
	//console.log("Add");
	//console.log(add_items);
	//find all items attached to actor, but not in world
	const rem_items = curr_items.filter(({ name: id1 }) => !world_items.some(({ name: id2 }) => id2 === id1));
	
	const delete_items = rem_items.map( i => i._id );
	//console.log("Delete");
	//console.log(delete_items);
	//delete all items attached to actor, but not in world
	await this.actor.deleteEmbeddedEntity("OwnedItem", delete_items);
	//attach any new items
	await this.actor.createEmbeddedEntity("OwnedItem", add_items);
  }
  
/* -------------------------------------------- */
  async _onUpdateBoxClick(event) {
	event.preventDefault();
	const item_id = $(event.currentTarget).data("item");
	var update_value = $(event.currentTarget).data("value");
    const update_type = $(event.currentTarget).data("utype");
    if ( update_value == undefined) {
		update_value = document.getElementById('fac-' + update_type + '-' + item_id).value;
	};
	
	if ( update_type == "heat" ) {
		var update = {_id: item_id, data:{heat:{value: update_value}}};
	} else if ( update_type == "wanted" ) {
		var update = {_id: item_id, data:{wanted:{value: update_value}}};
	} else if ( update_type == "status" ) {
		var update = {_id: item_id, data:{status:{value: update_value}}};
	} else if (update_type == "jobs" ) {
		var update = {_id: item_id, data:{jobs:{value: update_value}}};
	} else if (update_type == "is_damaged" ) {
		var update = {_id: item_id, data:{is_damaged: update_value}};
	} else {
		console.log("update attempted for type undefined in blades-sheet.js onUpdateBoxClick function");
		return;
	};
	console.log(update);
	await this.actor.updateEmbeddedEntity("OwnedItem", update);
	
   
  }

/* -------------------------------------------- */
  
  
}