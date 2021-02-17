import { Clock } from "./clock.js";
import { getSystemMapping } from "./systems/index.js";
import { log, warn } from "./util.js";

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

export class ClockSheet extends ActorSheet {
  static get defaultOptions() {
    const supportedSystem = getSystemMapping(game.data.system.id);
	  return mergeObject(
      super.defaultOptions,
      {
        classes: ["clocks", "sheet", `clocks-system-${game.data.system.id}`, "actor", "npc"],
        template: "systems/scum-and-villainy/templates/sheet.html",
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
    const clock = new Clock(this.system.loadClockFromActor({ actor: this.actor }));
    return mergeObject(super.getData(), {
      clock: {
        progress: clock.progress,
        size: clock.size,
        theme: clock.theme,
        image: {
          url: clock.image.img,
          width: clock.image.width,
          height: clock.image.height
        },
        settings: {
          sizes: Clock.sizes,
          themes: Clock.themes
        }
      }
    });
  }

  activateListeners (html) {
    super.activateListeners(html);

    html.find("button[name=minus]").click(async (ev) => {
      ev.preventDefault();
      const oldClock = new Clock(this.system.loadClockFromActor({ actor: this.actor }));
      this.updateClock(oldClock.decrement());
    });

    html.find("button[name=plus]").click(async (ev) => {
      ev.preventDefault();
      const oldClock = new Clock(this.system.loadClockFromActor({ actor: this.actor }));
      this.updateClock(oldClock.increment());
    });

    html.find("button[name=reset]").click(async (ev) => {
      ev.preventDefault();
      const oldClock = new Clock(this.system.loadClockFromActor({ actor: this.actor }));
      this.updateClock(new Clock({
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

    const oldClock = new Clock(this.system.loadClockFromActor({ actor: this.actor }));
    let newClock = new Clock({
      progress: oldClock.progress,
      size: form.size,
      theme: form.theme
    });
    await this.updateClock(newClock);
  }

  async updateClock(clock) {
    const actor = this.actor;

    // update associated tokens
    const tokens = actor.getActiveTokens();
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
