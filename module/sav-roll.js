/**
 * Roll Dice.
 * @param {int} dice_amount
 * @param {string} attribute_name
 * @param {string} position
 * @param {string} effect
 */
export async function savRoll(dice_amount, attribute_name = "", position = "risky", effect = "standard") {

  // ChatMessage.getSpeaker(controlledToken)
  let zeromode = false;
  //console.log(dice_amount);
  if ( dice_amount < 0 ) { dice_amount = 0; }
  if ( dice_amount == 0 ) { zeromode = true; dice_amount = 2; }

  let r = new Roll( `${dice_amount}d6`, {} );

  if (game.majorVersion > 7) {
    r.evaluate({async: true});
  } else {
    r.roll();
  };
  showChatRollMessage(r, zeromode, attribute_name, position, effect);
}

/**
 * Shows Chat message.
 *
 * @param {Roll} r
 * @param {Boolean} zeromode
 * @param {String} attribute_name
 * @param {string} position
 * @param {string} effect
 */
async function showChatRollMessage(r, zeromode, attribute_name = "", position = "", effect = "") {

  let speaker = ChatMessage.getSpeaker();
  let isBelow070 = isNewerVersion('0.7.0', game.data.version);
  let rolls = [];
  let attribute_label = SaVHelpers.getAttributeLabel(attribute_name);

  // Backward Compat for rolls.
  if (isBelow070) {
    rolls = (r.parts)[0].rolls;
  } else {
    rolls = (r.terms)[0].results;
  }

  // Retrieve Roll status.
  let roll_status = "";
  let resistance_rolls = ["insight", "prowess", "resolve"];
  let stress_result = 0;
  let stress_result_display = 0;
  let vice_result = 0;


  if ( attribute_name == "Fortune!" ) {
	  //console.log("Fortune roll " + attribute_name );
	  roll_status = getSaVFortuneRollStatus(rolls, zeromode);
  } else if ( resistance_rolls.includes( attribute_name ) ) {
	  //console.log("Resist roll " + attribute_name);
	  [ roll_status, stress_result ] = getSaVResistRollStatus(rolls, zeromode);
	  //console.log(roll_status);
	  stress_result_display = ( 6 - stress_result );
	  //console.log(stress_result_display);
	  position = "";
	  effect = "";
  } else if ( attribute_name == "Vice" ) {
	  //console.log("Vice roll " + attribute_name);
	  [ roll_status, vice_result ] = getSaVViceRollStatus(rolls, zeromode);
	  //console.log(vice_result);
	  position = "";
	  effect = "";
  } else if ( attribute_name == "upkeep" ) {
	  //console.log("Upkeep roll " + attribute_name);
	  roll_status = getSaVUpkeepRollStatus(rolls, zeromode);
	  position = "";
	  effect = "";
  } else {
	  //console.log("Action roll " + attribute_name );
	  roll_status = getSaVActionRollStatus(rolls, zeromode);
  }

  let position_localize = '';
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

  let effect_localize = '';
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

  let result = await renderTemplate("systems/scum-and-villainy/templates/sav-roll.html", {rolls: rolls, roll_status: roll_status, attribute_label: attribute_label, position: position, position_localize: position_localize, effect: effect, effect_localize: effect_localize, stress_result_display: stress_result_display, vice_result: vice_result, zeromode: zeromode});

  let messageData = {
    speaker: speaker,
    content: result,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    roll: r
  }

  if( game.majorVersion > 7 ) {
    CONFIG.ChatMessage.documentClass.create(messageData, {});
  } else {
    CONFIG.ChatMessage.entityClass.create(messageData, {});
  };
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

  // Dice API has changed in 0.7.0 so need to keep that in mind.
  let isBelow070 = isNewerVersion('0.7.0', game.data.version);

  let sorted_rolls = [];
  // Sort roll values from lowest to highest.
  if (isBelow070) {
    sorted_rolls = rolls.map(i => i.roll).sort();
  } else {
    sorted_rolls = rolls.map(i => i.result).sort();
  }

  let roll_status = "failure"

  if (sorted_rolls[0] === 6 && zeromode) {
    roll_status = "critical-success";
  }
  else {
    let use_die;
    let prev_use_die = false;

    if (zeromode) {
      use_die = sorted_rolls[0];
    }
    else {
      use_die = sorted_rolls[sorted_rolls.length - 1];

      if (sorted_rolls.length - 2 >= 0) {
        prev_use_die = sorted_rolls[sorted_rolls.length - 2]
      }
    }

    // 1,2,3 = failure
    if (use_die <= 3) {
      roll_status = "failure";
    }
    // if 6 - check the prev highest one.
    else if (use_die === 6) {
      // 6,6 - critical success
      if (prev_use_die && prev_use_die === 6) {
        roll_status = "critical-success";
      }
      // 6 - success
      else {
        roll_status = "success";
      }
    }
    // else (4,5) = partial success
    else {
      roll_status = "partial-success";
    }

  }

  return roll_status;

}

export function getSaVFortuneRollStatus(rolls, zeromode = false) {

  // Dice API has changed in 0.7.0 so need to keep that in mind.
  let isBelow070 = isNewerVersion('0.7.0', game.data.version);

  let sorted_rolls = [];
  // Sort roll values from lowest to highest.
  if (isBelow070) {
    sorted_rolls = rolls.map(i => i.roll).sort();
  } else {
    sorted_rolls = rolls.map(i => i.result).sort();
  }

  let roll_status = "poor"

  if (sorted_rolls[0] === 6 && zeromode) {
    roll_status = "great";
  }
  else {
    let use_die;
    let prev_use_die = false;

    if (zeromode) {
      use_die = sorted_rolls[0];
    }
    else {
      use_die = sorted_rolls[sorted_rolls.length - 1];

      if (sorted_rolls.length - 2 >= 0) {
        prev_use_die = sorted_rolls[sorted_rolls.length - 2]
      }
    }

    // 1,2,3 = failure
    if (use_die <= 3) {
      roll_status = "poor";
    }
    // if 6 - check the prev highest one.
    else if (use_die === 6) {
      // 6,6 - critical success
      if (prev_use_die && prev_use_die === 6) {
        roll_status = "great";
      }
      // 6 - success
      else {
        roll_status = "standard";
      }
    }
    // else (4,5) = partial success
    else {
      roll_status = "limited";
    }

  }

  return roll_status;

}

export function getSaVResistRollStatus(rolls, zeromode = false) {

  // Dice API has changed in 0.7.0 so need to keep that in mind.
  let isBelow070 = isNewerVersion('0.7.0', game.data.version);
  let use_die;
  let sorted_rolls = [];
  // Sort roll values from lowest to highest.
  if (isBelow070) {
    sorted_rolls = rolls.map(i => i.roll).sort();
  } else {
    sorted_rolls = rolls.map(i => i.result).sort();
  }

  let roll_status = "resist"

  if (sorted_rolls[0] === 6 && zeromode) {
    roll_status = "critical-resist";
	use_die = sorted_rolls[0];
  }
  else {

    let prev_use_die = false;

    if (zeromode) {
      use_die = sorted_rolls[0];
    }
    else {
      use_die = sorted_rolls[sorted_rolls.length - 1];

      if (sorted_rolls.length - 2 >= 0) {
        prev_use_die = sorted_rolls[sorted_rolls.length - 2]
      }
    }

    // 1,2,3 = failure
    if (use_die <= 3) {
      roll_status = "resist";
    }
    // if 6 - check the prev highest one.
    else if (use_die === 6) {
      // 6,6 - critical success
      if (prev_use_die && prev_use_die === 6) {
        roll_status = "critical-resist";
      }
      // 6 - success
      else {
        roll_status = "resist";
      }
    }
    // else (4,5) = partial success
    else {
      roll_status = "resist";
    }

  }

  return [roll_status, use_die];

}

export function getSaVViceRollStatus(rolls, zeromode = false) {

  // Dice API has changed in 0.7.0 so need to keep that in mind.
  let isBelow070 = isNewerVersion('0.7.0', game.data.version);
  let use_die;
  let sorted_rolls = [];
  // Sort roll values from lowest to highest.
  if (isBelow070) {
    sorted_rolls = rolls.map(i => i.roll).sort();
  } else {
    sorted_rolls = rolls.map(i => i.result).sort();
  }

  let roll_status = "vice"

  let prev_use_die = false;

  if (zeromode) {
    use_die = sorted_rolls[0];
  }
  else {
    use_die = sorted_rolls[sorted_rolls.length - 1];

    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  return [roll_status, use_die];

}

export function getSaVUpkeepRollStatus(rolls, zeromode = false) {

  // Dice API has changed in 0.7.0 so need to keep that in mind.
  let isBelow070 = isNewerVersion('0.7.0', game.data.version);
  let use_die;
  let sorted_rolls = [];
  // Sort roll values from lowest to highest.
  if (isBelow070) {
    sorted_rolls = rolls.map(i => i.roll).sort();
  } else {
    sorted_rolls = rolls.map(i => i.result).sort();
  }

  let roll_status = "upkeep"

  if (sorted_rolls[0] === 6 && zeromode) {
    roll_status = "damaged";
	use_die = sorted_rolls[0];
  }
  else {

    let prev_use_die = false;

    if (zeromode) {
      use_die = sorted_rolls[0];
    }
    else {
      use_die = sorted_rolls[sorted_rolls.length - 1];

      if (sorted_rolls.length - 2 >= 0) {
        prev_use_die = sorted_rolls[sorted_rolls.length - 2]
      }
    }

    // 1,2,3 = failure
    if (use_die <= 3) {
      roll_status = "nodamage";
    }
    // if 6 - check the prev highest one.
    else if (use_die === 6) {
      // 6,6 - critical success
      if (prev_use_die && prev_use_die === 6) {
        roll_status = "damaged";
      }
      // 6 - success
      else {
        roll_status = "damaged";
      }
    }
    // else (4,5) = partial success
    else {
      roll_status = "malfunction";
    }

  }

  return roll_status;

}

/**
 * Call a Roll popup.
 */
export async function simpleRollPopup() {

  new Dialog({
    title: `Fortune Roll`,
    content: `
      <h2>${game.i18n.localize("BITD.FortuneRoll")}</h2>
      <p>${game.i18n.localize("BITD.RollTokenDescription")}</p>
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("BITD.RollNumberOfDice")}:</label>
          <select id="qty" name="qty">
            ${Array(11).fill().map((item, i) => `<option value="${i}">${i}d</option>`).join('')}
          </select>
        </div>
      </form>
    `,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: `Roll`,
        callback: (html) => {
          let diceQty = html.find('[name="qty"]')[0].value;
          savRoll(diceQty, "Fortune!", "", "");
        },
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize('Cancel'),
      },
    },
    default: "yes"
  }).render(true);
}
