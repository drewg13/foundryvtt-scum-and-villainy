//import DND5E from "./dnd5e.js";
//import BitD from "./blades-in-the-dark.js";
import SaV from "./scum-and-villainy.js";

const SUPPORTED_SYSTEMS = {
  //"blades-in-the-dark": BitD,
  //"dnd5e": DND5E,
  "scum-and-villainy": SaV
};

const defaultLoadClockFromActor = ({ actor }) => {
  return {
    progress: actor.getFlag("scum-and-villainy", "clocks.progress"),
    size: actor.getFlag("scum-and-villainy", "clocks.size"),
    theme: actor.getFlag("scum-and-villainy", "clocks.theme")
  };
};

const defaultLoadClockFromItem = ({ item }) => {
  console.log(item);
  return {
    progress: item.data.data.goal_clock.value,
    size: item.data.data.goal_clock.max,
    theme: game.system.savclocks.themes[game.settings.get("scum-and-villainy", "defaultClockTheme")]
  };
};

const defaultPersistClockToActor = async ({ clock }) => {
  return {
    flags: {
      "scum-and-villainy": {
	    clocks: {
          progress: clock.progress,
          size: clock.size,
          theme: clock.theme
        }
      }
	}
  };
};

export const getSystemMapping = (id) => {
  const defaultSystemConfig = {
    loadClockFromActor: defaultLoadClockFromActor,
    persistClockToActor: defaultPersistClockToActor,
    loadClockFromItem: defaultLoadClockFromItem
  };

  if (!SUPPORTED_SYSTEMS[id]) {
    return {
      id,
      ...defaultSystemConfig,
      registerSheetOptions: {
        types: game.data.system.template.Actor.types
      }
    };
  }

  return {
    id,
    ...defaultSystemConfig,
    ...SUPPORTED_SYSTEMS[id]
  };
};
