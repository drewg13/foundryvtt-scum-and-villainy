export const registerSystemSettings = function() {

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("scum-and-villainy", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });

  game.settings.register("scum-and-villainy", "defaultClockTheme", {
    name: "BITD.ClockSettingDefaultTheme",
    hint: "BITD.ClockSettingDefaultThemeHint",
    scope: "world",
    config: true,
    type: Number,
    choices: game.system.savclocks.themes,
	  default: 0,
	  icon: "fas fa-palette"
  });

  game.settings.register("scum-and-villainy", "defaultAttributeXPBarSize", {
    name: "BITD.AttributeXPBarSize",
    hint: "BITD.AttributeXPBarSizeHint",
    scope: "world",
    config: true,
    type: Number,
    range: {
      min: 1,
      max: 12,
      step: 1
    },
    default: 6
  });

  game.settings.register("scum-and-villainy", "defaultPlaybookXPBarSize", {
    name: "BITD.PlaybookXPBarSize",
    hint: "BITD.PlaybookXPBarSizeHint",
    scope: "world",
    config: true,
    type: Number,
    range: {
      min: 1,
      max: 12,
      step: 1
    },
    default: 8
  });

  game.settings.register("scum-and-villainy", "defaultCrewXPBarSize", {
    name: "BITD.CrewXPBarSize",
    hint: "BITD.CrewXPBarSizeHint",
    scope: "world",
    config: true,
    type: Number,
    range: {
      min: 1,
      max: 12,
      step: 1
    },
    default: 8
  });

  game.settings.register("scum-and-villainy", "logResourceToChat", {
    name: "BITD.LogResourceToChat",
    hint: "BITD.LogResourceToChatHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("scum-and-villainy", "useDropdownsInRollDialog", {
    name: "BITD.UseDropdownsInRollDialog",
    hint: "BITD.UseDropdownsInRollDialogHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });
};
