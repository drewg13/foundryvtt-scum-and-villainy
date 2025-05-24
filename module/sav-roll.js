/**
 * Roll Dice.
 * @param {int} dice_amount
 * @param {string} attribute_name
 * @param {string} position
 * @param {string} effect
 * @param {string} purpose
 * @param {string} speaker_name
 */
export async function savRoll(dice_amount, attribute_name = "", position = "risky", effect = "standard", purpose = "", speaker_name = "") {

  let zeromode = false;

  if ( dice_amount < 0 ) { dice_amount = 0; }
  if ( dice_amount === 0 ) { zeromode = true; dice_amount = 2; }

  let r = new Roll( `${dice_amount}d6`, {} );

  await r.evaluate();

  await showChatRollMessage( r, zeromode, attribute_name, position, effect, purpose, speaker_name );
}

/**
 * Shows Chat message.
 *
 * @param {Roll} r
 * @param {Boolean} zeromode
 * @param {String} attribute_name
 * @param {string} position
 * @param {string} effect
 * @param {string} purpose
 * @param {string} speaker_name
 */
async function showChatRollMessage(r, zeromode, attribute_name = "", position = "", effect = "", purpose = "", speaker_name = "") {

  let speaker = ChatMessage.getSpeaker();
  if( speaker_name ) { speaker.alias = speaker_name }
  let rolls = (r.terms)[0].results;
  let method = {};
  method.type = (r.terms)[0].method;
  if( method.type ) {
    method.icon = CONFIG.Dice.fulfillment.methods[method.type].icon;
    method.label = CONFIG.Dice.fulfillment.methods[method.type].label;
  }
  let attribute_label;
  if( attribute_name === "fortune"){
    attribute_label = game.i18n.localize("BITD.Fortune");
  } else {
    attribute_label = SaVHelpers.getAttributeLabel(attribute_name);
  }

  // Retrieve Roll status.
  let roll_status;
  const att_obj = game.model.Actor.character.attributes;
  const resistance_rolls = Object.keys( att_obj );
  let stress_result = 0;
  let stress_result_display = 0;
  let vice_result = 0;


  if ( attribute_name === "fortune" ) {
	  roll_status = getSaVFortuneRollStatus(rolls, zeromode);
  } else if ( resistance_rolls.includes( attribute_name ) ) {
	  [ roll_status, stress_result ] = getSaVResistRollStatus(rolls, zeromode);
	  stress_result_display = ( 6 - stress_result );
	  position = "";
	  effect = "";
  } else if ( attribute_name === "vice" ) {
	  [ roll_status, vice_result ] = getSaVViceRollStatus(rolls, zeromode);
	  position = "";
	  effect = "";
  } else if ( attribute_name === "upkeep" ) {
	  roll_status = getSaVUpkeepRollStatus(rolls, zeromode);
	  position = "";
	  effect = "";
  } else {
	  roll_status = getSaVActionRollStatus(rolls, zeromode);
  }

  let position_localize;
  switch (position) {
    case 'controlled':
      position_localize = 'BITD.PositionControlled'
      break;
    case 'desperate':
      position_localize = 'BITD.PositionDesperate'
      break;
    case 'risky':
    default:
      position_localize = 'BITD.PositionRisky'
  }

  let effect_localize;
  switch (effect) {
    case 'limited':
      effect_localize = 'BITD.EffectLimited'
      break;
    case 'great':
      effect_localize = 'BITD.EffectGreat'
      break;
    case 'standard':
    default:
      effect_localize = 'BITD.EffectStandard'
  }

  let result = await foundry.applications.handlebars.renderTemplate("systems/scum-and-villainy/templates/sav-roll.html", {rolls: rolls, method: method, roll_status: roll_status, attribute_label: attribute_label, position: position, position_localize: position_localize, effect: effect, effect_localize: effect_localize, stress_result_display: stress_result_display, vice_result: vice_result, zeromode: zeromode, purpose: purpose});

  let messageData = {
    speaker: speaker,
    content: result,
    rolls: [r]
  }

  await ChatMessage.create(messageData);
}

/**
 * Get status of the Roll.
 *  - failure
 *  - partial-success
 *  - success
 *  - critical-success
 * @param {Array} rolls
 * @param {Boolean} zeromode
 */
export function getSaVActionRollStatus(rolls, zeromode = false) {

  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();

  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "failure";
  } else if (use_die === 6) {
    // if 6 - check the prev highest one.
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "critical-success";
    } else {
    // 6 - success
      roll_status = "success";
    }
  } else {
    // else (4,5) = partial success
    roll_status = "partial-success";
  }

  return roll_status;
}

export function getSaVFortuneRollStatus(rolls, zeromode = false) {

  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();

  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "poor";
  } else if (use_die === 6) {
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "great";
    } else {
      roll_status = "standard";
    }
  } else {
    roll_status = "limited";
  }

  return roll_status;
}

export function getSaVResistRollStatus(rolls, zeromode = false) {

  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();

  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "resist";
  } else if (use_die === 6) {
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "critical-resist";
    } else {
      roll_status = "resist";
    }
  } else {
    roll_status = "resist";
  }

  return [roll_status, use_die];
}

export function getSaVViceRollStatus(rolls, zeromode = false) {

  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();

  let roll_status = "vice";
  let use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
  }

  return [roll_status, use_die];
}

export function getSaVUpkeepRollStatus(rolls, zeromode = false) {

  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();

  let roll_status;
  let use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "nodamage";
  } else if (use_die === 6) {
    roll_status = "damaged";
  } else {
    roll_status = "malfunction";
  }

  return roll_status;
}

/**
 * Call a Roll popup.
 */
export async function simpleRollPopup() {

  new Dialog({
    title: `${game.i18n.localize("BITD.FortuneRoll")}`,
    content: `
      <h2>${game.i18n.localize("BITD.FortuneRoll")}</h2>
      <p>${game.i18n.localize("BITD.RollTokenDescription")}</p>
      <form>
        <div class="form-group">
          <div class="flex-vertical">
            <div>
              <label>${game.i18n.localize("BITD.RollNumberOfDice")}:</label>
              <select id="qty" name="qty">
                ${Array(11).fill().map((item, i) => `<option value="${i}">${i}d</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="roll-purpose">${game.i18n.localize("BITD.RollPurpose")}:</label>
              <input id="roll-purpose" type="text" name="purpose">
            </div>
          </div>
        </div>
      </form>
    `,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: game.i18n.localize("BITD.Roll"),
        callback: async (html) => {
          let diceQty = html.find('[name="qty"]')[0].value;
          let purpose = html.find('[name="purpose"]')[0].value;
          await savRoll( parseInt(diceQty), "fortune", "", "", purpose );
        },
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize("BITD.Cancel"),
      },
    },
    default: "yes"
  }).render(true);
}

/**
 * Call a Lifestyle Roll popup.
 */
export async function lifestyleRollPopup( coins ) {
  const selected = Math.floor( coins / 10 );
  const rollArray = Array(11).fill().map((item, i) => {if( i === selected ){ return `<option value="${i}" selected>${i}d</option>` } else { return `<option value="${i}">${i}d</option>` }}).join('');
  new Dialog({
    title: `${game.i18n.localize("BITD.FortuneRoll")}`,
    content: `
      <h2>${game.i18n.localize("BITD.FortuneRoll")}</h2>
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("BITD.RollNumberOfDice")}:</label>
          <select id="qty" name="qty">
            ${rollArray}
          </select>
        </div>
      </form>
    `,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: game.i18n.localize("BITD.Roll"),
        callback: async (html) => {
          let diceQty = html.find('[name="qty"]')[0].value;
          await savRoll(parseInt(diceQty), "fortune", "", "");
        },
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize("BITD.Cancel"),
      },
    },
    default: "yes"
  }).render(true);
}
