import { warn } from "./sav-clock-util.js";

export class SaVHelpers {

  /**
   * Identifies duplicate items by type and returns a array of item ids to remove
   *
   * @param {Object} item_data
   * @param {Document} actor
   * @returns {Array}
   *
   */
  static removeDuplicatedItemType(item_data, actor) {
    let dupe_list = [];
    let distinct_types = ["crew_reputation", "class", "background", "vice", "heritage", "ship_size", "crew_type"];
    let allowed_types = ["item"];
    let should_be_distinct = distinct_types.includes(item_data.type);
    // If the Item has the exact same name - remove it from list.
    // Remove Duplicate items from the array.
    actor.items.forEach( i => {
      let has_double = (item_data.type === i.type);
      if ( ( ( i.name === item_data.name ) || ( should_be_distinct && has_double ) ) && !( allowed_types.includes( item_data.type ) ) && ( item_data._id !== i.id ) ) {
        dupe_list.push (i.id);
      }
    });

    return dupe_list;
  }

  /**
   * Adds default abilities when class is chosen for character
   *
   * @param {Object} item_data
   * @param {Document} actor
   */
  static async addDefaultAbilities(item_data, actor) {

    let def_abilities = item_data.system.def_abilities || {};

    let abil_list = def_abilities.split(', ');
    let item_type = "";
    let items_to_add = [];

    if ( actor.type === "character" ) {
      item_type = "ability";
    } else if ( actor.type === "ship" ) {
      item_type = "crew_upgrade";
    }

    let abilities = actor.items.filter(a => a.type === item_type).map(e => {return e.name});

    if ( actor.type === "ship" ) {
      let size = actor.items.filter(a => a.type === "ship_size").map(e => {return e.name}) || [""];
      if ( size.length > 0 ) { abilities.push( size ); }
    }

    let friends = actor.items.filter(a => a.type === "friend").map(e => {return e.name}) || [""];
    if ( friends.length > 0 ) { abilities.push( friends ); }

    let items = await SaVHelpers.getAllItemsByType(item_type, game);

    if ( actor.type === "ship" ) {
      let all_sizes = await SaVHelpers.getAllItemsByType("ship_size", game);
      all_sizes.forEach( s => { items.push( s ); });
    }

    let all_friends = await SaVHelpers.getAllItemsByType("friend", game);
    all_friends.forEach( s => { items.push( s ); });

    let trim_abil_list = abil_list.filter( x => !abilities.includes( x ) );
    trim_abil_list.forEach(i => {
      items_to_add.push( items.find( e => ( e.name === i ) ));
    });

    actor.createEmbeddedDocuments("Item", items_to_add);
  }


  /**
   * Get a nested dynamic attribute.
   * @param {Object} obj
   * @param {string} property
   */
  static getNestedProperty(obj, property) {
    return property.split('.').reduce((r, e) => {
        return r[e];
    }, obj);
  }


  /**
   * Add item functionality
   */
  static _addOwnedItem(event, actor) {

    event.preventDefault();
    const a = event.currentTarget;
    const item_type = a.dataset.itemType;

    let data = {
      name: randomID(),
      type: item_type
    };

    return actor.createEmbeddedDocuments("Item", [data]);
  }

  /**
   * Get the list of all available ingame items by Type.
   *
   * @param {string} item_type
   * @param {Object} game
   */
  static async getAllItemsByType(item_type, game) {

    let game_items = game.items.filter(e => e.type === item_type).map(e => {return e}) || [];
    let pack = game.packs.find(e => e.metadata.name === item_type);
    let compendium_content = await pack.getDocuments();

    let compendium_items = compendium_content.map(k => {return k}) || [];
    compendium_items = compendium_items.filter(a => game_items.filter(b => a.name === b.name && a.name === b.name).length === 0);

    let list_of_items = game_items.concat(compendium_items) || [];
    list_of_items.sort(function(a, b) {
      let nameA = a.name.toUpperCase();
      let nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    return list_of_items;
  }
  /* -------------------------------------------- */

  static async getAllActorsByType(item_type, game) {
    let actors = game.actors.filter( e => e.type === item_type ).map( e => { return e } ) || [];
    let addId = actors.map( a => ({...a, id: a._id}));
    return addId;
  }

  /* -------------------------------------------- */

  static getProperCase( name ) {
    return name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();
  }

  /* -------------------------------------------- */
  /**
   * Returns the label for attribute.
   *
   * @param {string} attribute_name
   * @returns {string}
   */
  static getAttributeLabel(attribute_name) {
    // Calculate Dice to throw.
    let attribute_labels = {};
    let attributes = {};

    // There has to be a better way to to do this
    // @todo - pull skill list dynamically
    const skills = ["insight","doctor","hack","rig","study","prowess","helm","scramble","scrap","skulk","resolve","intuit","command","consort","sway"];
    const systems = ["crew","upkeep","engines","comms","weapons","hull","shields","encryptor"];

    if (skills.indexOf(attribute_name) !== -1 ) {
      attributes = game.system.model.Actor.character.attributes;
    } else if (systems.indexOf(attribute_name) !== -1 ) {
      attributes = game.system.model.Actor.ship.systems;
    } else {
      return game.i18n.localize( "BITD." + SaVHelpers.getProperCase(attribute_name) );
    }

    for (const a in attributes) {
      attribute_labels[a] = attributes[a].label;
      for (const skill_name in attributes[a].skills) {
        attribute_labels[skill_name] = attributes[a].skills[skill_name].label;
      }
    }

    return attribute_labels[attribute_name];
  }

  /* -------------------------------------------- */

  /**
   * Creates options for faction clocks.
   *
   * @param {int[]} sizes
   *  array of possible clock sizes
   * @param {int} default_size
   *  default clock size
   * @param {int} current_size
   *  current clock size
   * @returns {string}
   *  html-formatted option string
   */
  static createListOfClockSizes( sizes, default_size, current_size ) {

    let text = ``;

    sizes.forEach( size => {
      text += `<option value="${size}"`;
      if ( !( current_size ) && ( size === default_size ) ) {
        text += ` selected`;
      } else if ( size === current_size ) {
        text += ` selected`;
      }

      text += `>${size}</option>`;
    });

    return text;

  }

  /* -------------------------------------------- */

  /**
   * Creates a chat notification on a resource change
   *
   * @param {string} actor
   *  actor on which change occurred
   * @param {string} resource
   *  localized resource name
   * @param {int} oldValue
   *  original resource value
   * @param {int} newValue
   *  new resource value
   */
  static chatNotify( actor, resource, oldValue, newValue ) {
    let change;
    if( newValue > oldValue ) {
      change = '+' + String( newValue - oldValue );
    } else {
      change = String( newValue - oldValue );
    }
    let color = newValue >= oldValue ? 'green' : 'red'
    let message = `<div class="resource-chat-notification">${ actor }<table><tr><td>${ resource }</td><td class="value">${ oldValue }</td><td class="arrow"><i class="fas fa-arrow-right"></i></td><td class="value"><span class="${ color }">${ newValue }</span></td><td><span class="small">(${ change })</span></td></tr></table></div>`;
    ChatMessage.create({content: message});
  }

  /* -------------------------------------------- */

  /**
   * Creates a chat notification on a resource change
   *
   * @param {string} actor
   *  actor on which change occurred
   * @param {string} resource
   *  localized resource name
   */
  static chatNotifyString( actor, resource ) {
    let message = `<div class="resource-chat-notification">${ actor }<table><tr><td>${ resource }</td></tr></table></div>`;
    ChatMessage.create({content: message});
  }

  /* -------------------------------------------- */

  /**
  * Creates a Tile on a canvas
  *
  * @param {Object} canvas
  *  canvas Object where the Tile should be created
  * @param {Object} data
  *  data describing Tile to be created
  */
  static async createTile( canvas, data ) {
    if ( data.type === "Item" ) {
      const sourceData = await fromUuid( data.uuid );
      if( ( sourceData.type === "planet" ) || ( sourceData.type === "star_system" ) ) {
        let tileImg = sourceData.img.replace( /webp/g, "webm" );

        try {
          const t = await loadTexture( tileImg );
          let tileData = {
            img: tileImg,
            width: t.width,
            height: t.height,
            x: data.x,
            y: data.y
          };

          await canvas.scene.createEmbeddedDocuments( "Tile", [ tileData ] );

        } catch( error ) {
          ui.notifications.warn( "Error creating Tile, there needs to exist a WEBM file with the same filename and location as the Item img WEBP" )
        }
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Gets files from a specified directory matching the target
   *
   * @param {string} target
   *  target variable to pass to FilePicker.browse()
   * @param {string[]} extensions
   *  data describing Tile to be created
   * @param {Boolean} wildcard
   *
   * @param {string} source
   *  source variable to pass to FilePicker.browse()
   */
  static async getFiles(target, extensions, wildcard = false, source = "user")
  {
    extensions = extensions instanceof Array ? extensions : [extensions];
    let options = { extensions: extensions, wildcard: wildcard };
    let filePicker = await FilePicker.browse(source, target, options);
    if(filePicker.files)
      return [...filePicker.files];
    return [];
  }

}
