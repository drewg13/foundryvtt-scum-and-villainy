import { SaVClock } from "./sav-clock.js";
import { getSystemMapping } from "./systems/index.js";
import { log, error } from "./sav-clock-util.js";

const DISPLAY_NAME = {
  ALWAYS_FOR_EVERYONE: 50
};
const DISPOSITION = {
  NEUTRAL: 0
};
const DEFAULT_TOKEN = {
  scale: 1,
  disposition: DISPOSITION.NEUTRAL,
  displayName: DISPLAY_NAME.ALWAYS_FOR_EVERYONE,
  actorLink: true
};

export class SaVClockSheet extends ActorSheet {
  static get defaultOptions() {
    const supportedSystem = getSystemMapping(game.data.system.id);
    //update to foundry.utils.mergeObject
    return mergeObject(
      super.defaultOptions,
      {
        classes: ["clocks", "sheet", `clocks-system-${game.data.system.id}`, "actor", "npc"],
        template: "systems/scum-and-villainy/templates/sav-clock-sheet.html",
        width: 360,
        height: 550,
        ...supportedSystem.sheetDefaultOptions
      }
    );
  }

/*  static register () {
    const supportedSystem = getSystemMapping(game.data.system.id);
    Actors.registerSheet(supportedSystem.id, ClockSheet, supportedSystem.registerSheetOptions);
    log("Sheet Registered");
  }
*/
  constructor (...args) {
    super(...args);
    this._system = getSystemMapping(game.data.system.id);
  }

  get system () {
    return this._system;
  }

  getData () {

    let clock;
    if( game.majorVersion > 7 ) {
      clock = new SaVClock(this.system.loadClockFromActor({ actor: this.document }));
    } else {
      clock = new SaVClock(this.system.loadClockFromActor({ actor: this.actor }));
    }
    //update to foundry.utils.mergeObject
    const data = mergeObject(super.getData(), {
      clock: {
        progress: clock.progress,
        size: clock.size,
        theme: clock.theme,
        image: {
          url: clock.image.img,
          width: clock.image.widthSheet,
          height: clock.image.heightSheet
        },
        settings: {
          sizes: SaVClock.sizes,
          themes: SaVClock.themes
        },
		    flags: clock.flags
      }
    });
    data.editable = data.options.editable;
    //console.log(data);
    return data;
  }

  activateListeners (html) {
    super.activateListeners(html);

    html.find("button[name=minus]").click(async (ev) => {
      ev.preventDefault();
      let oldClock;
      if( game.majorVersion > 7 ) {
        oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.document }));
      } else {
        oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.actor }));
      }
      await this.updateClock(oldClock.decrement());
    });

    html.find("button[name=plus]").click(async (ev) => {
      ev.preventDefault();
      let oldClock;
      if( game.majorVersion > 7 ) {
        oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.document }));
      } else {
        oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.actor }));
      }
      await this.updateClock(oldClock.increment());
    });

    html.find("button[name=reset]").click(async (ev) => {
      ev.preventDefault();
      let oldClock;
      if( game.majorVersion > 7 ) {
        oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.document }));
      } else {
        oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.actor }));
      }
      await this.updateClock(new SaVClock({
        theme: oldClock.theme,
        progress: 0,
        size: oldClock.size
      }));
    });
  }

  async _updateObject(_event, form) {
    await this.object.update({
      name: form.name
    });

    let oldClock;
    if( game.majorVersion > 7 ) {
      oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.document }));
    } else {
      oldClock = new SaVClock(this.system.loadClockFromActor({ actor: this.actor }));
    }
    let newClock = new SaVClock({
      progress: oldClock.progress,
      size: form.size,
      theme: form.theme
    });
    await this.updateClock(newClock);
  }

  async updateClock(clock) {
    let actor;
    if( game.majorVersion > 7 ) {
      actor = this.document;
    } else {
      actor = this.actor;
    }

    // update associated tokens
    const tokens = actor.getActiveTokens();

    if( game.majorVersion > 7 ) {
      let update = [];
      let tokenObj = {};
      for (const t of tokens) {
        tokenObj = {
          _id: t.id,
          name: actor.name,
          img: clock.image.img,
          actorLink: true
        };
        update.push(tokenObj);
      }
      await TokenDocument.updateDocuments(update, {parent: game.scenes.current});

      // update the Actor
      const persistObj = await this.system.persistClockToActor({ actor, clock });
	    const visualObj = {
        img: clock.image.img,
        token: {
          img: clock.image.img,
          ...DEFAULT_TOKEN
        }
      };
      //update to foundry.utils.mergeObject
      await actor.update( mergeObject( visualObj, persistObj ) );

    } else {
      for (const t of tokens) {
      await t.update({
        name: actor.name,
        img: clock.image.img,
        actorLink: true
      });
      }

      // update the Actor
      const persistObj = await this.system.persistClockToActor({ actor, clock });
	    const visualObj = {
        img: clock.image.img,
        token: {
          img: clock.image.img,
          ...DEFAULT_TOKEN
        }
      };
      await actor.update(mergeObject(visualObj, persistObj));
    }
  }
}

export default {

  renderTokenHUD: async (_hud, html, token) => {

  log("Render")
  let t = canvas.tokens.get(token.id);
  let a = game.actors.get(token.actorId);

  if( !a?.data?.flags['scum-and-villainy']?.clocks ) {
    return false;
  }

  const button1HTML = await renderTemplate('systems/scum-and-villainy/templates/sav-clock-button1.html');
  const button2HTML = await renderTemplate('systems/scum-and-villainy/templates/sav-clock-button2.html');

  html.find("div.left").append(button1HTML).click(async (event) => {
    log("HUD Clicked")
    // re-get in case there has been an update
    t = canvas.tokens.get(token.id);

    const oldClock = new SaVClock(a.data.flags['scum-and-villainy'].clocks);
    let newClock;

    const target = event.target.classList.contains("control-icon")
      ? event.target
      : event.target.parentElement;
      if (target.classList.contains("cycle-size")) {
        newClock = oldClock.cycleSize();
      } else if (target.classList.contains("cycle-theme")) {
        newClock = oldClock.cycleTheme();
	    } else if (target.classList.contains("config")) {
		    return;
      } else {
        return error("ERROR: Unknown TokenHUD Button");
      }

	  const persistObj = {
        flags: {
          "scum-and-villainy": {
		        clocks: {
              progress: newClock.progress,
              size: newClock.size,
              theme: newClock.theme
            }
          }
		    }
      };

	  const visualObj = {
        img: newClock.image.img,
        token: {
          img: newClock.image.img,
          ...DEFAULT_TOKEN
        }
      };

    if( game.majorVersion > 7 ) {
      //update to foundry.utils.mergeObject
      let newObj = mergeObject(visualObj, persistObj);
      let tokenObj = {};
      let update = [];
      //update to foundry.utils.mergeObject
      update.push( mergeObject( { "_id": a.id }, newObj ) );
      await Actor.updateDocuments(update);

      update = [];
	    const tokens = a.getActiveTokens();
      for (const t of tokens) {
        tokenObj = {
          _id: t.id,
          name: a.name,
          img: newClock.image.img,
	  	    flags: newClock.flags,
          actorLink: true
        };
        update.push(tokenObj);
      }

      await TokenDocument.updateDocuments(update, {parent: game.scenes.current});
    } else {
      await a.update( mergeObject( visualObj, persistObj ) );

  	  const tokens = a.getActiveTokens();
      for (const t of tokens) {
        await t.update({
          name: a.name,
          img: newClock.image.img,
	    	  flags: newClock.flags,
          actorLink: true
        });
      }
    }
  });


  html.find("div.right").append(button2HTML).click(async (event) => {
    log("HUD Clicked")
    // re-get in case there has been an update
    t = canvas.tokens.get(token.id);

    const oldClock = new SaVClock(a.data.flags['scum-and-villainy'].clocks);
    let newClock;

    const target = event.target.classList.contains("control-icon")
      ? event.target
      : event.target.parentElement;
      if (target.classList.contains("progress-up")) {
        newClock = oldClock.increment();
      } else if (target.classList.contains("progress-down")) {
        newClock = oldClock.decrement();
      } else if (target.classList.contains("visibility")) {
		    return;
      } else {
        return error("ERROR: Unknown TokenHUD Button");
      }

	  const persistObj = {
        flags: {
          "scum-and-villainy": {
		        clocks: {
              progress: newClock.progress,
              size: newClock.size,
              theme: newClock.theme
            }
          }
		    }
      };

	  const visualObj = {
        img: newClock.image.img,
        token: {
          img: newClock.image.img,
          ...DEFAULT_TOKEN
        }
    };

    if( game.majorVersion > 7 ) {
      //update to foundry.utils.mergeObject
      let newObj = mergeObject(visualObj, persistObj);
      let tokenObj = {};
      let update = [];
      //update to foundry.utils.mergeObject
      update.push( mergeObject( { "_id": a.id }, newObj ) );
      await Actor.updateDocuments(update);

      update = [];
	    const tokens = a.getActiveTokens();
      for (const t of tokens) {
        tokenObj = {
          _id: t.id,
          name: a.name,
          img: newClock.image.img,
	  	    flags: newClock.flags,
          actorLink: true
        };
        update.push(tokenObj);
      }

      await TokenDocument.updateDocuments(update, {parent: game.scenes.current});
    } else {
      await a.update(mergeObject(visualObj, persistObj));

  	  const tokens = a.getActiveTokens();
      for (const t of tokens) {
        await t.update({
          name: a.name,
          img: newClock.image.img,
	    	  flags: newClock.flags,
          actorLink: true
        });
      }
    }
  });
return true;
}}
