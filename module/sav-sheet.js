/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class SaVSheet extends ActorSheet {

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

	  let items = await SaVHelpers.getAllItemsByType(item_type, game);
    let html = `<div id="items-to-add">`;
		html += `<label class="label-stripe-gray flex-horizontal">`;
    if (item_type === "ability") {
			html += `<div class="flex one">${game.i18n.localize("BITD.StartAbility")}</div>`;
		}
		if ( (item_type === "ability") || (item_type === "crew_ability") ) {
			html += `<div class="flex one">${game.i18n.localize("BITD.RecommAbility")}</div>`;
		}
		html += `<div class="flex ten">${game.i18n.localize("BITD." + item_type )}</div>`;
		if (item_type === "item") {
			html += `<div class="flex one">${game.i18n.localize("BITD.Load")}</div>`;
		} else if ( item_type === "crew_upgrade" ){
			html += `<div class="flex one">${game.i18n.localize("BITD.Cost")}</div>`;
		}
		html += `<div class="flex one">${game.i18n.localize("BITD.Info")}</div>`;
		html += `</label>`;

		let ship_actors = this.actor.getFlag("scum-and-villainy", "ship") || [];
		let actor = game.actors.get( ship_actors[0]?._id );

		let main_systems = ["Engines", "Hull", "Comms", "Weapons"];
		let overloaded = {};

    if ( this.actor.type === "ship" ) {
		  main_systems.forEach( m => {
  	    let actor_items = this.actor.items.filter( i => i.system.class === m );
	  	  let total = actor_items.length;
        let lower_m = m.toLowerCase();
		    if ( total >= this.actor.system.systems[lower_m].value ) {
			 	  overloaded[m] = 1;
			  } else {
			    overloaded[m] = 0;
			  }
		  });
    }

    items.forEach(e => {
      let addition_price_load = ``;

      if (typeof e.system.load !== "undefined") {
        addition_price_load += `${e.system.load}`
      } else if (typeof e.system.price !== "undefined") {
        addition_price_load += `${e.system.price}`
      }

	    const nonclass_upgrades = ["Auxiliary", "Gear", "Training", "Upgrades"];

      if (e.type === "crew_upgrade") {
		    if ( ( ( main_systems.includes( e.system.class ) ) && ( overloaded[ ( e.system.class.charAt(0).toUpperCase() + e.system.class.slice(1) ) ] === 0 ) ) || ( nonclass_upgrades.includes(e.system.class) ) || ( e.system.class === this.actor.system.ship_class ) ) {
					html += `<div class="flex-horizontal">`;
					html += `<div class="flex ten new-item"><input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
					html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
					html += `${game.i18n.localize(e.name)}</label></div>`;
					html += `<div class="flex one">${addition_price_load}</div>`;
					html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
					html += `</div></div>`;
		    }
	    } else if (e.type === "crew_ability") {
		    if (e.system.class === this.actor.system.ship_class) {
					html += `<div class="flex-horizontal">`;
					html += `<div class="flex one abilities"><input id="recommended-${e._id}" type="radio" disabled`;
					if (e.system.recommended) { html += ` checked`; }
					html += `><label for="recommended-${e._id}"></label></div>`;
					html += `<div class="flex ten new-item"><input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
			    html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
			    html += `${game.i18n.localize(e.name)}</label></div>`;
					html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
					html += `</div></div>`;
		    }
	    } else if (e.type === "ability") {
		    if (e.system.class === this.actor.system.character_class) {
					html += `<div class="flex-horizontal">`;
					html += `<div class="flex one abilities"><input id="starting-${e._id}" type="radio" disabled`;
					if (e.system.starting) { html += ` checked`; }
					html += `><label for="starting-${e._id}"></label></div>`;
					html += `<div class="flex one abilities"><input id="recommended-${e._id}" type="radio" disabled`;
					if (e.system.recommended) { html += ` checked`; }
					html += `><label for="recommended-${e._id}"></label></div>`;
					html += `<div class="flex ten new-item"><input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
			    html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
			    html += `${game.i18n.localize(e.name)}</label></div>`;
					html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
					html += `</div></div>`;
		    }
	    } else if (e.type === "item") {
		    if ((e.system.class === "Standard") || ((this.actor.system.stun_weapons === 1) && (e.system.class === "Non-Lethal")) || (e.system.class === this.actor.system.character_class)) {
					html += `<div class="flex-horizontal">`;
					html += `<div class="flex ten new-item"><input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
					html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
					html += `${game.i18n.localize(e.name)}</label></div>`;
					html += `<div class="flex one">${addition_price_load}</div>`;
					html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
					html += `</div></div>`;
		    }
	    } else if (e.type === "friend") {
		    if ( (e.system.class === this.actor.system.character_class) || (e.system.class === this.actor.system.ship_class) ) {
					html += `<div class="flex-horizontal">`;
					html += `<div class="flex ten new-item"><input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
					html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
					html += `${game.i18n.localize(e.name)}</label></div>`;
					html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
					html += `</div></div>`;
		    }
	    } else if (e.type ==="faction") {
				html += `<div class="flex-horizontal">`;
				html += `<div class="flex ten new-item"><input id="select-item-${ e._id }" type="${ input_type }" name="select_items" value="${ e._id }">`;
				html += `<label class="flex-horizontal" for="select-item-${ e._id }">`;
				html += `${ game.i18n.localize( e.name ) }</label></div>`;
				html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
				html += `</div></div>`;
			} else if (e.type === "planet") {
				if ( e.system.system === limiter ) {
					html += `<div class="flex-horizontal">`;
					html += `<div class="flex ten new-item"><input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
					html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
					html += `${game.i18n.localize(e.name)}</label></div>`;
					html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
					html += `</div></div>`;
				}
			} else {
				html += `<div class="flex-horizontal">`;
				html += `<div class="flex ten new-item"><input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
				html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
				html += `${game.i18n.localize(e.name)}</label></div>`;
				html += `<div class="flex one">${addition_price_load}</div>`;
				html += `<div class="flex one"><i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
				html += `</div></div>`;
			}
    });

		if (item_type === "ability") {
			html += `</div><br>${ game.i18n.localize( "BITD.AbilityLegend1" ) }<br>${ game.i18n.localize( "BITD.AbilityLegend2" ) }<br>`;
		} else if (item_type === "crew_ability") {
			html += `</div><br><br>${ game.i18n.localize( "BITD.AbilityLegend2" ) }<br>`;
		} else if (item_type === "crew_upgrade") {
			html += `</div>${ game.i18n.localize( "BITD.CrewAbilityLegend" ) }`;
		} else {
		  html += `</div><br><br><br>`;
		}

    let options = {
      width: "500"
    }

		if ( this.actor.isOwner ) {
      let dialog = new Dialog({
        title: `${game.i18n.localize('BITD.Add')} ${game.i18n.localize('BITD.'+item_type)}`,
        content: html,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize('BITD.Add'),
            callback: async () => await this.addItemsToSheet(item_type, $(document).find("#items-to-add"))
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

	let items = await SaVHelpers.getAllActorsByType(item_type, game);
  let html = `<div id="items-to-add">`;
  items.forEach(e => {
	  if (e.type === item_type) {
  	  html += `<input id="select-item-${e.id}" type="${input_type}" name="select_items" value="${e.id}">`;
      html += `<label class="flex-horizontal" for="select-item-${e.id}">`;
      html += `${game.i18n.localize(e.name)} <i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.designation)}"></i>`;
      html += `</label>`;
	  }
  });

  html += `</div>`;

  let options = {
    // width: "500"
  }

	if ( this.actor.isOwner ) {
    let dialog = new Dialog({
      title: `${game.i18n.localize('BITD.Add')} ${game.i18n.localize('BITD.' + SaVHelpers.getProperCase(item_type) )}`,
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('BITD.Add'),
          callback: async () => await this.addFlagsToSheet(item_type, $(document).find("#items-to-add"))
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
}


  /* -------------------------------------------- */

  async addItemsToSheet(item_type, el) {
	  let items = await SaVHelpers.getAllItemsByType(item_type, game);
    let items_to_add = [];

    el.find("div.new-item input:checked").each(function() {
		  items_to_add.push(items.find(e => e._id === $(this).val()));
    });

	  if ( this.actor.isOwner ) {
		  await Item.create(items_to_add, {parent: this.document});
	  }
  }

  async addFlagsToSheet(item_type, el) {
	  let items = await SaVHelpers.getAllActorsByType(item_type, game);
	  let items_to_add = [];

    el.find("input:checked").each(function() {
		  items_to_add.push(items.find(e => e.id === $(this).val()));
    });

    if ( this.actor.isOwner ) {
	    await this.actor.setFlag("scum-and-villainy", item_type, items_to_add);
	  }
  }

  /* -------------------------------------------- */

  /**
   * Roll an Attribute die.
   * @param {*} event
   */
  async _onRollAttributeDieClick(event) {

    const attribute_name = $(event.currentTarget).data("rollAttribute");
    const att_obj = game.model.Actor.character.attributes;
	  const sys_obj = game.model.Actor.ship.systems;
	  let systems = Object.keys( sys_obj );
    const resistance = Object.keys( att_obj );
    const remove = ["crew", "upkeep"];
	  let actions = [];
    resistance.forEach( a => {
      let skill_obj = game.model.Actor.character.attributes[a].skills;
      actions.push( Object.keys( skill_obj ) );
    })
	  systems = systems.filter( system => !remove.includes( system ) );
	  actions.push( systems );
	  actions = actions.flat();
    let roll_type;

    if ( actions.includes( attribute_name ) ) {
    	this.actor.rollActionPopup( attribute_name );
    } else {
    	if ( resistance.includes( attribute_name ) ) {
    		roll_type = "resistance";
			} else {
    		roll_type = attribute_name;
			}
    	this.actor.rollSimplePopup( attribute_name, roll_type );
    }
  }

  /* -------------------------------------------- */
  async _onUpdateClick(event) {
	  event.preventDefault();
	  const item_type = $(event.currentTarget).data("itemType");
	  const limiter = $(event.currentTarget).data("limiter");

	  //find all items of type in world
	  const world_items = await SaVHelpers.getAllItemsByType(item_type, game);

	  //find all items of type attached to actor
	  let curr_items = this.actor.items.filter(i => i.type === item_type);

	  //find all items in world, but not attached to actor
	  const add_items = world_items.filter(({ name: id1 }) => !curr_items.some(({ name: id2 }) => id2 === id1));

	  //find all items attached to actor, but not in world
	  const rem_items = curr_items.filter(({ name: id1 }) => !world_items.some(({ name: id2 }) => id2 === id1));

	  const delete_items = rem_items.map( i => i.id );

		//delete all items attached to actor, but not in world
	  await this.document.deleteEmbeddedDocuments("Item", delete_items);
	  //attach any new items
	  await this.document.createEmbeddedDocuments("Item", add_items);
  }

/* -------------------------------------------- */
  async _onUpdateBoxClick(event) {
	  event.preventDefault();
	  const item_id = $(event.currentTarget).data("item");
	  let update_value = $(event.currentTarget).data("value");
    const update_type = $(event.currentTarget).data("utype");
    let update = {};

    if ( update_value === undefined) {
		  update_value = document.getElementById('fac-' + update_type + '-' + item_id).value;
	  }

	  if ( update_type === "heat" ) {
		  update = {_id: item_id, system:{heat:{value: update_value}}};
	  } else if ( update_type === "wanted" ) {
		  update = {_id: item_id, system:{wanted:{value: update_value}}};
	  } else if ( update_type === "status" ) {
	  	update = {_id: item_id, system:{status:{value: update_value}}};
	  } else if (update_type === "jobs" ) {
	  	update = {_id: item_id, system:{jobs:{value: update_value}}};
	  } else if (update_type === "is_damaged" ) {
	  	update = {_id: item_id, system:{is_damaged: update_value}};
	  } else {
	  	console.log("update attempted for type undefined in sav-sheet.js onUpdateBoxClick function");
		  return;
	  }

    await Item.updateDocuments([update], {parent: this.actor});
  }

/* -------------------------------------------- */

}
