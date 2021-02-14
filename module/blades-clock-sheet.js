
import { BladesSheet } from "./blades-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesClockSheet extends BladesSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["scum-and-villainy", "sheet", "actor"],
  	  template: "systems/scum-and-villainy/templates/actors/clock-sheet.html",
      width: 270,
      height: 350,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {

    let image_path = `/systems/scum-and-villainy/styles/assets/progressclocks/Progress Clock ${formData['data.type']}-${formData['data.value']}.webp`;
    formData['img'] = image_path;
    formData['token.img'] = image_path;

    let data = {
      img: image_path,
      width: 1,
      height: 1,
      scale: 1,
      mirrorX: false,
      mirrorY: false,
      tint: "",
      displayName: 50
    };

    let tokens = this.actor.getActiveTokens();

    tokens.forEach(function(token) {
      token.update(data);
    });

    // Update the Actor
    return this.object.update(formData);
  }

  /* -------------------------------------------- */

}
