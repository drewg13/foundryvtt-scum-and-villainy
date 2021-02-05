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

    // This is a workaround until is being fixed in FoundryVTT.
    if ( this.options.submitOnChange ) {
      html.on("change", "textarea", this._onChangeInput.bind(this));  // Use delegated listener on the form
    }

    html.find(".roll-die-attribute").click(this._onRollAttributeDieClick.bind(this));
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

    items.forEach(e => {
      let addition_price_load = ``;
      
      if (typeof e.data.load !== "undefined") {
        addition_price_load += `(${e.data.load})`
      } else if (typeof e.data.price !== "undefined") {
        addition_price_load += `(${e.data.price})`
      }
	  
	  var nonclass_upgrades = ["Auxiliary", "Gear", "Training", "Upgrades", "Engines", "Comms", "Hull", "Weapons"];
	  
	  if ((e.type !== "crew_upgrade") || nonclass_upgrades.includes(e.data.class,0) ||(e.data.class == this.actor.data.data.ship_class)) {
	  if ((e.type !== "crew_ability") || (e.data.class == this.actor.data.data.ship_class)) {
      if ((e.type !== "ability") || (e.data.class == this.actor.data.data.character_class)) {
	  if ((e.type !== "item") || (e.data.class == "Standard") ||(e.data.class == this.actor.data.data.character_class)) {
	  html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
      html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
      html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(e.data.description)}</span></i>`;
      html += `</label>`;
	  }}}}
    });

    html += `</div>`;

    let options = {
      // width: "500"
    }
    
    let dialog = new Dialog({
      title: `${game.i18n.localize('Add')} ${item_type}`,
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('Add'),
          callback: () => this.addItemsToSheet(item_type, $(document).find('#items-to-add'))
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('Cancel'),
          callback: () => false
        }
      },
      default: "two"
    }, options);

    dialog.render(true);
  };

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
      title: `${game.i18n.localize('Add')} ${item_type}`,
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('Add'),
          callback: () => this.addFlagsToSheet(item_type, $(document).find('#items-to-add'))
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('Cancel'),
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

}