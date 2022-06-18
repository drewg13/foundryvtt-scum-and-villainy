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
       if(  actor?.documentName === "Actor" ) {
         removeItems = SaVHelpers.removeDuplicatedItemType( data, actor );
       }
       if( removeItems.length !== 0 ) {
         await actor.deleteEmbeddedDocuments( "Item", removeItems );
       }
     }

		if ( this.type === "star_system" ) {
      let stars = await SaVHelpers.getFiles("systems/scum-and-villainy/styles/assets/stars/star*", ".webp", true);
      let random = Math.floor( Math.random() * stars.length ) + 1;
      this.updateSource( { img: stars[random] } );
    }
		if ( this.type === "planet" ) {
      let planets = await SaVHelpers.getFiles("systems/scum-and-villainy/styles/assets/planets/planet*", ".webp", true);
      let random = Math.floor( Math.random() * planets.length ) + 1;
      this.updateSource( { img: planets[random] } );
    }
   }

   /* -------------------------------------------- */

   /** @override */
   async _onCreate( data, options, userId ) {
     super._onCreate( data, options, userId );

     if( userId === game.user.id ) {
       let actor = this.parent ? this.parent : null;

       if( ( actor?.documentName === "Actor" ) && ( actor?.permission >= CONST.ENTITY_PERMISSIONS.OWNER ) ) {

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

	  if (this.type === "faction") {
      this._prepareStatusDefault( this.system );
      this.system.size_list = SaVHelpers.createListOfClockSizes( game.system.savclocks.sizes, this.system.goal_clock_max, parseInt( this.system.goal_clock.max ) );
    }
  };

  _prepareStatusDefault( data ) {

	  let status = data.status.value;

	  if ( this ) {
		  if ( ( status === "0" ) || ( status === 0 ) ) { status = 4; }
		  this.system.status.value = status;
	  }
  };

  async sendToChat() {
    let itemData = this.toObject();

    if (itemData.img.includes("/mystery-man")) {
      itemData.img = null;
    }
    const html = await renderTemplate("systems/scum-and-villainy/templates/items/chat-item.html", itemData);
    const chatData = {
      user: game.userId,
      content: html,
    };
    await ChatMessage.create( chatData );
  }
}
