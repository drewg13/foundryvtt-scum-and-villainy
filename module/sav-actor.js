import { savRoll } from "./sav-roll.js";
import { SaVHelpers } from "./sav-helpers.js";

/**
 * Extend the basic Actor
 * @extends {Actor}
 */
export class SaVActor extends Actor {

  /** @override */
  static async create(data, options={}) {

    data.token = data.token || {};

    // For Crew and Character set the Token to sync with charsheet.

    let icon;
    switch ( data.type ) {
      case "universe": {
  	    icon = "systems/scum-and-villainy/styles/assets/icons/galaxy.png";
  	    data.token.actorLink = true;
        data.token.name = data.name;
        data.token.displayName = 50;
  	    break;
  	  }
  	  case "ship": {
  	    icon = "systems/scum-and-villainy/styles/assets/icons/ufo.png";
  	    data.token.actorLink = true;
        data.token.name = data.name;
        data.token.displayName = 50;
  	    break;
  	  }
  	  case "character":
      case "npc": {
  	    icon = "systems/scum-and-villainy/styles/assets/icons/astronaut-helmet.png";
  	    data.token.actorLink = true;
        data.token.name = data.name;
        data.token.displayName = 50;
  	    break;
  	  }
  	  case "\uD83D\uDD5B clock": {
  	    icon = "systems/scum-and-villainy/themes/blue/4clock_0.webp";
  	    data.token.actorLink = true;
        data.token.name = data.name;
        data.token.displayName = 50;
  	    break;
  	  }
    }
    if( data.img === undefined ) {
      data.img = icon;
    }

    await super.create(data, options);
  }

  /* -------------------------------------------- */

  /** @override */
  async _preCreate( createData, options, userId ) {
    await super._preCreate( createData, options, userId );
    const updateData = {};

    if( createData.type === "character" ) {
      const playbookXP = game.settings.get( "scum-and-villainy", "defaultPlaybookXPBarSize" );
      const attributeXP = game.settings.get( "scum-and-villainy", "defaultAttributeXPBarSize" );

      if( playbookXP ) {
        updateData['system.experienceMax'] = playbookXP;
      }
      if( attributeXP ) {
        const attributes = Object.keys( game.system.model.Actor.character.attributes );
        attributes.forEach( a => updateData['system.attributes.'+ a + '.expMax'] = attributeXP );
      }
    }

    if( createData.type === "ship" ) {
      const crewXP = game.settings.get( "scum-and-villainy", "defaultCrewXPBarSize" );

      if( crewXP ) {
        updateData['system.crew_experienceMax'] = crewXP;
      }

    }

    await this.data.update( updateData );
  }

  /* -------------------------------------------- */

  /** @override */
  prepareDerivedData() {

    if ( this.type === "ship" ) {
      // calculates upkeep value from (crew quality + engine quality + hull quality + comms quality + weapons quality) / 4, rounded down
      this.system.systems.upkeep.value = Math.floor((parseInt(this.system.systems.crew.value) + parseInt(this.system.systems.engines.value) + parseInt(this.system.systems.hull.value) + parseInt(this.system.systems.comms.value) + parseInt(this.system.systems.weapons.value)) / 4);
    }
  }


  /** @override */
  getRollData() {
    const data = super.getRollData();
    const att_obj = game.system.model.Actor.character.attributes;
	  const attributes = Object.keys( att_obj );
    data.dice_amount = this.getAttributeDiceToThrow();
    if ( this.type === "character" ) {
      const attribute_values = attributes.map( a => data.dice_amount[a] );
      data.dice_amount.vice = Math.min( ...attribute_values );
    }
    return data;
  }

  /* -------------------------------------------- */
  /**
   * Calculate Attribute Dice to throw.
   */
  getAttributeDiceToThrow() {

    // Calculate Dice to throw.
    let dice_amount = {};

	  switch (this.type) {
	    case 'character':
	      for (const a in this.system.attributes) {
          dice_amount[a] = 0;
		      // Add +1d to resistance rolls only for Forged item on ship
		      let ship_actors = this.getFlag("scum-and-villainy", "ship") || [];
          let actor = game.actors.get( ship_actors[0]?._id );
		      if (actor?.system.installs.forged_inst === 1) {
		        dice_amount[a]++;
		      }

		      for (const s in this.system.attributes[a].skills) {
		        dice_amount[s] = parseInt(this.system.attributes[a].skills[s]['value'][0])

		        // We add a +1d for every skill higher than 0.
		        if ( dice_amount[s] > 0 ) {
		          dice_amount[a]++;
		        }
		      }
		    }
	      break;

	    case 'ship':
	      for (const a in this.system.systems) {
	        dice_amount[a] = 0;
		      if ( a === "upkeep" ) {
		        dice_amount[a] = parseInt(this.system.systems[a]['damage'][0])
		      }
		      else {
		        dice_amount[a] = parseInt(this.system.systems[a]['value'][0]) - parseInt(this.system.systems[a]['damage'][0]);
		        if (dice_amount[a] < 0) { dice_amount[a] = 0 }
		      }
	      }
	      break;
	  }

    return dice_amount;
  }

  /* -------------------------------------------- */

  rollActionPopup(attribute_name) {

    let attribute_label = SaVHelpers.getAttributeLabel(attribute_name);

    // Calculate Dice Amount for Attributes
    const base_dice = this.getRollData().dice_amount[attribute_name];
    let total_dice = base_dice;

    let dropdowns = game.settings.get("scum-and-villainy", "useDropdownsInRollDialog");

    if( dropdowns ) {
      new Dialog( {
        title: `${ game.i18n.localize( 'BITD.Roll' ) } ${ game.i18n.localize( attribute_label ) }`,
        content: `
        <div id="skill-roll">
		      <h2>${ game.i18n.localize( 'BITD.Roll' ) } ${ game.i18n.localize( attribute_label ) } (${ total_dice }d)</h2>
          <form>
            <div class="form-group roll position">
              <label>${ game.i18n.localize( 'BITD.Position' ) }:</label>
              <select id="pos" name="pos">
                <option value="controlled">${ game.i18n.localize( 'BITD.PositionControlled' ) }</option>
                <option value="risky" selected>${ game.i18n.localize( 'BITD.PositionRisky' ) }</option>
                <option value="desperate">${ game.i18n.localize( 'BITD.PositionDesperate' ) }</option>
              </select>
            </div>
            <div class="form-group roll effect">
              <label>${ game.i18n.localize( 'BITD.Effect' ) }:</label>
              <select id="fx" name="fx">
                <option value="limited">${ game.i18n.localize( 'BITD.EffectLimited' ) }</option>
                <option value="standard" selected>${ game.i18n.localize( 'BITD.EffectStandard' ) }</option>
                <option value="great">${ game.i18n.localize( 'BITD.EffectGreat' ) }</option>
              </select>
            </div>
            <div class="form-group roll base-dice">
              <label class="base-dice">${ game.i18n.localize( 'BITD.BaseDice' ) }: </label>
			        <label>${ base_dice }d</label>
            </div>
            <div class="form-group roll mod">
              <label>${ game.i18n.localize( 'BITD.Modifier' ) }:</label>
              <select id="mod" name="mod" data-base-dice="${ base_dice }">
                ${ this.createListOfDiceMods( -3, +3, 0 ) }
              </select>
            </div>
		        <div class="form-group roll total-rolled">
              <label class="total-rolled">${ game.i18n.localize( 'BITD.TotalDice' ) }: </label>
			        <label>${ total_dice }d</label>
            </div>
          </form>
		      <h2>${ game.i18n.localize( 'BITD.RollOptions' ) }</h2>
		      <div class="action-info">${ game.i18n.localize( 'BITD.ActionsHelp' ) }</div>
        </div>
      `,
        buttons: {
          yes: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize( 'BITD.Roll' ),
            callback: async( html ) => {
              let modifier = parseInt( html.find( '[name="mod"]' )[0].value );
              let position = html.find( '[name="pos"]' )[0].value;
              let effect = html.find( '[name="fx"]' )[0].value;
              await this.rollAttribute( attribute_name, modifier, position, effect );
            }
          },
          no: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize( 'Cancel' ),
          },
        },
        default: "yes",
        render: html => {
          $( "#skill-roll #mod" ).on( "change", this._onDiceModChange );
        }
      } ).render( true );
    } else {
      new Dialog( {
        title: `${ game.i18n.localize( 'BITD.Roll' ) } ${ game.i18n.localize( attribute_label ) }`,
        content: `
        <div id="skill-roll">
		      <h2>${ game.i18n.localize( 'BITD.Roll' ) } ${ game.i18n.localize( attribute_label ) } (${ total_dice }d)</h2>
          <form>
            <div class="form-group roll position">
              <label>${ game.i18n.localize( 'BITD.Position' ) }:</label>
              <div class="rollRadio" id="pos">
                <input type="radio" id="controlled" name="pos" value="controlled" />
                <label for="controlled">${ game.i18n.localize( 'BITD.PositionControlled' ) }</label>
                <input type="radio" id="risky" name="pos" value="risky" checked/>
                <label for="risky">${ game.i18n.localize( 'BITD.PositionRisky' ) }</label>
                <input type="radio" id="desperate" name="pos" value="desperate" />
                <label for="desperate">${ game.i18n.localize( 'BITD.PositionDesperate' ) }</label>
              </div>
            </div>
            <hr>
            <div class="form-group roll effect">
              <label>${ game.i18n.localize( 'BITD.Effect' ) }:</label>
              <div class="rollRadio" id="fx">
                <input type="radio" id="limited" name="fx" value="limited" />
                <label for="limited">${ game.i18n.localize( 'BITD.EffectLimited' ) }</label>
                <input type="radio" id="standard" name="fx" value="standard" checked/>
                <label for="standard">${ game.i18n.localize( 'BITD.EffectStandard' ) }</label>
                <input type="radio" id="great" name="fx" value="great" />
                <label for="great">${ game.i18n.localize( 'BITD.EffectGreat' ) }</label>
              </div>
            </div>
            <hr>
            <div class="form-group roll base-dice">
              <label class="base-dice">${ game.i18n.localize( 'BITD.BaseDice' ) }: </label>
			        <label>${ base_dice }d</label>
            </div>
            <div class="form-group roll mod">
              <label>${ game.i18n.localize( 'BITD.Modifier' ) }:</label>
              <select id="mod" name="mod" data-base-dice="${ base_dice }">
                ${ this.createListOfDiceMods( -3, +3, 0 ) }
              </select>
            </div>
		        <div class="form-group roll total-rolled">
              <label class="total-rolled">${ game.i18n.localize( 'BITD.TotalDice' ) }: </label>
			        <label>${ total_dice }d</label>
            </div>
            <hr>
          </form>
		      <h2>${ game.i18n.localize( 'BITD.RollOptions' ) }</h2>
		      <div class="action-info">${ game.i18n.localize( 'BITD.ActionsHelp' ) }</div>
        </div>
      `,
        buttons: {
          yes: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize( 'BITD.Roll' ),
            callback: async( html ) => {
              let modifier = parseInt( html.find( '[name="mod"]' )[0].value );
              let position = $( 'input:radio[name="pos"]:checked' )[0].value;
              let effect = $( 'input:radio[name="fx"]:checked' )[0].value;
              await this.rollAttribute( attribute_name, modifier, position, effect );
            }
          },
          no: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize( 'BITD.Cancel' ),
          },
        },
        default: "yes",
        render: html => {
          $( "#skill-roll #mod" ).on( "change", this._onDiceModChange );
        }
      } ).render( true );
    }
  }

  /* -------------------------------------------- */

  rollSimplePopup(attribute_name, roll_type) {

    let attribute_label = SaVHelpers.getAttributeLabel(attribute_name);

    // Calculate Dice Amount for Attributes
    const base_dice = this.getRollData().dice_amount[attribute_name];

    let total_dice = base_dice;
    const proper_attribute_name = SaVHelpers.getProperCase(roll_type);

    new Dialog({
      title: `${game.i18n.localize('BITD.Roll')} ${game.i18n.localize(attribute_label)}`,
      content: `
        <div id="skill-roll">
		      <h2>${game.i18n.localize('BITD.Roll')} ${game.i18n.localize(attribute_label)} (${total_dice}d)</h2>
          <form>
            <div class="form-group roll base-dice">
              <label class="base-dice">${game.i18n.localize('BITD.BaseDice')}: </label>
			        <label>${base_dice}d</label>
            </div>
            <div class="form-group roll mod">
              <label>${game.i18n.localize('BITD.Modifier')}:</label>
              <select id="mod" name="mod" data-base-dice="${base_dice}">
                ${this.createListOfDiceMods(-3,+3,0)}
              </select>
            </div>
		        <div class="form-group roll total-rolled">
              <label class="total-rolled">${game.i18n.localize('BITD.TotalDice')}: </label>
			        <label>${total_dice}d</label>
            </div>
            <h2>${game.i18n.localize('BITD.RollOptions')}</h2>
		        <div class="action-info">${game.i18n.localize('BITD.' + proper_attribute_name + 'Help')}</div>
          </form>
        </div>
      `,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize('BITD.Roll'),
          callback: async (html) => {
            let modifier = parseInt(html.find('[name="mod"]')[0].value);
            let position = "";
            let effect = "";
            await this.rollAttribute(attribute_name, modifier, position, effect);
          }
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize('Cancel'),
        },
      },
      default: "yes",
      render: html => {
        $("#skill-roll #mod").on( "change", this._onDiceModChange);
      }
    }).render(true);
  }

  /* -------------------------------------------- */

  async rollAttribute( attribute_name = "", additional_dice_amount = 0, position, effect ) {
    let dice_amount = 0;

    if ( attribute_name !== "" ) {
      let roll_data = this.getRollData();
	    dice_amount += roll_data.dice_amount[attribute_name];
    }
    else {
      dice_amount = 1;
    }
    dice_amount += additional_dice_amount;

    await savRoll( dice_amount, attribute_name, position, effect );
  }

  /* -------------------------------------------- */

  /**
   * Create <options> for available actions
   *  which can be performed.
   */
  createListOfActions() {

    let text = '';
    const att_obj = game.system.model.Actor.character.attributes;
    const attributes = Object.keys( att_obj );

    for ( let attribute in attributes ) {

      let skills = attributes[attribute].skills;

      text += `<optgroup label="${attribute} Actions">`;
      text += `<option value="${attribute}">${attribute} (Resist)</option>`;

      for ( let skill in skills ) {
        text += `<option value="${skill}">${skill}</option>`;
      }

      text += `</optgroup>`;

    }

    return text;
  }

  /* -------------------------------------------- */

  /**
   * Creates <options> modifiers for dice roll.
   *
   * @param {int} rs
   *  Min die modifier
   * @param {int} re
   *  Max die modifier
   * @param {int} s
   *  Selected die
   */
  createListOfDiceMods( rs, re, s = 0 ) {

    let text = ``;

    for ( let i = rs; i <= re; i++ ) {
      let plus = "";
      if ( i >= 0 ) { plus = "+" }
      text += `<option value="${i}"`;
      if ( i === s ) {
        text += ` selected`;
      }

      text += `>${plus}${i}d</option>`;
    }

    return text;

  }

  /* -------------------------------------------- */

  /**
   * Change dice total on display
   * @param {*} event
   */
  async _onDiceModChange( event ) {
    let mod = this.value;
    let base = this.dataset.baseDice;

    $( "#skill-roll .total-rolled label:nth-child(2)" ).text( parseInt( base ) + parseInt( mod ) + "d" );
  }

}
