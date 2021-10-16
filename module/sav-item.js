import { SaVHelpers } from "./sav-helpers.js";

 /**
 * Extend the basic Item
 * @extends {Item}
 */
export class SaVItem extends Item {

   /** @override */
   async _preCreate( data, options, user ) {
     await super._preCreate( data, options, user );

     let removeItems = [];
     if( user.id === game.user.id ) {
       let actor = this.parent ? this.parent : null;
       if( ( game.majorVersion > 7 ) && ( actor?.documentName === "Actor" ) ) {
         removeItems = SaVHelpers.removeDuplicatedItemType( data, actor );
       }
       if( removeItems.length !== 0 ) {
         await actor.deleteEmbeddedDocuments( "Item", removeItems );
       }
     }
		 
		if ( this.type === "star_system" ) {
      this.data.update({img: "systems/scum-and-villainy/styles/assets/icons/orbital.png"});
    }
		if ( this.type === "planet" ) {
      this.data.update({img: "systems/scum-and-villainy/styles/assets/icons/moon-orbit.png"});
    }
   }

   /* -------------------------------------------- */

   /** @override */
   async _onCreate( data, options, userId ) {
     super._onCreate( data, options, userId );

     if( userId === game.user.id ) {
       let actor = this.parent ? this.parent : null;

       if( ( game.majorVersion > 7 ) && ( actor?.documentName === "Actor" ) && ( actor?.permission >= CONST.ENTITY_PERMISSIONS.OWNER ) ) {

         if( ( ( data.type === "class" ) || ( data.type === "crew_type" ) ) && ( data.data.def_abilities !== "" ) ) {
           await SaVHelpers.addDefaultAbilities( data, actor );
         }

         if( ( ( data.type === "class" ) || ( data.type === "crew_type" ) ) && ( ( actor.img.slice( 0, 46 ) === "systems/scum-and-villainy/styles/assets/icons/" ) || ( actor.img === "icons/svg/mystery-man.svg" ) ) ) {
           const icon = data.img;
           const icon_update = {
             img: icon,
             token: {
               img: icon
             }
           };
           await actor.update( icon_update );
         }
       }
     }
   }

   /* -------------------------------------------- */


  /** override */
  prepareData() {
    super.prepareData();

    const item_data = this.data;
    const data = item_data.data;

	  if (item_data.type === "faction") {
      this._prepareStatusDefault( data );
      data.size_list = SaVHelpers.createListOfClockSizes( game.system.savclocks.sizes, data.goal_clock_max, parseInt( data.goal_clock.max ) );
    }
  };

  _prepareStatusDefault( data ) {

	  let status = data.status.value;

	  if ( this ) {
		  if ( ( status === "0" ) || ( status === 0 ) ) { status = 4; }
		  data.status.value = status;
	  }
  };

  async sendToChat() {
    let itemData;
    if( game.majorVersion > 7 ) {
      itemData = this.data.toObject();
    } else {
      itemData = this.data;
    }

    if (itemData.img.includes("/mystery-man")) {
      itemData.img = null;
    }
    const html = await renderTemplate("systems/scum-and-villainy/templates/items/chat-item.html", itemData);
    const chatData = {
      user: game.userId,
      content: html,
    };
    const message = await ChatMessage.create(chatData);
  }
}
