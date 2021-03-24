# FoundryVTT Scum and Villainy character and ship sheets

An attempt to adapt the Blades in the Dark system created by megastruktur to Scum and Villainy

## IMPORTANT NOTES

I've seen some reports of loss-of-data from the Notes fields on the character sheets, so please be careful with them.  If you can reproduce the behavior reliably, please let me know. This may have been fixed with the switch to using the tinyMCE for those fields, PLEASE let me know if it continues. (thanks to Lardo#4626 for the suggestion and example code)

You DO NOT need to import any items out of the compendiums in order to use them.  Currently, if you do import them, the system should ignore the compendium version on the assumption that you imported the item in order to edit it.


## Recommended Modules

- Ernie's Modern UI
- DSN (with chrome dice!)
- Forien's Easy Polls (for helping players make a final decision)
- The Furnace (for advanced macros)
- Tabletop RPG Music (some good sci-fi ambience)


## Usage
`"Actor" - Universe (system/planet/faction trackers), ships, characters, clocks`

`"Item" - all classes, ship types, upgrades, items, abilities, etc.`

- 1st thing, create a Universe sheet to track systems, planets, and factions.  Click Update Systems and Update Planets to auto-populate the sheet with all available systems and planets.
- If, at a later date, you add a custom system/planet to your game, click the relevant update link again to bring it onto the sheet.
- Only currently relevant factions should be tracked, as the sheet will get huge otherwise.  If there's a strong need for a separate faction sheet, let me know.
- PLEASE NOTE that deleting a faction from the sheet (or re-adding an already present faction) will delete all associated status and job info.  Faction tiers are editable from the faction item sheet linked from the faction name.
- To reset reputation, exp, etc counters just click on the label name or the nearby 0 icon.
- To add items, you can click a corresponding label to bring up a popup containing all eligible items.
- All "class/ship" specific items are prefixed with first letters, but item lists on the character sheet should be correctly limited to the appropriate items.
- If you want/need to add an item that does not appear in the popup list (for example, adding a Veteran ability), just drag and drop it from the proper compendium.
- To see the description of Class, Vice, Background, etc you can just click added item and see all the info in the popup.
- When adding a new item you can hover over a "question-circle" icon to see the item's description.
- To add Custom abilities, items, systems, planets, factions, etc.,  just add a new "Foundry Item" of the corresponding type and fill all the necessary info. Then drag it to the sheet or add via button on a sheet.
- When editing/adding new abilities to the Ship sheet, if they have an effect on the linked Character sheets, you must unlink and relink the Ship to see the effects.
- BE CAREFUL removing items.  Any item removed from an actor sheet will lose all linked data and will have to be recreated.

Classes:
- (Me)  Mechanic
- (Mu)  Muscle
- (My)  Mystic
- (P)   Pilot
- (Sc)  Scoundrel
- (Sp)  Speaker
- (St)  Stitch

Ship Types:
- (S)  Stardancer
- (C)  Cerberus
- (F)  Firedrake


## Screenshots

### Character Sheet, Crew Sheet and Class
TBD

### Compendium
TBD

### Rolls
TBD

## Clocks 
(thanks to TyrannosaurusRoy for permission to use the UI code from his great Clocks module!)

Clock Actors

Clock Actors live in your Actors tab (and can be dragged onto a scene as a token). To get started, create a new actor and select the clock actor type. Change a clock setting (such as theme or size) or hit the Reset button (between the plus/minus buttons) to generate the correct clock artwork, if it doesn't appear as expected.  Note that you can right-click Clock tokens for some of the same UI buttons from Clock Tiles for modifying the clock which will carry over to the linked actor.  Multiple clock tokens linked to the same actor should stay in sync within the same scene, but tokens in different scenes will have to have the sheet opened to sync up.

Clock Tiles

Clock Tiles are useful for quick, disposable clocks you'd like to drop onto the scene but don't plan to keep around for long. Click the new Clock button in the Tiles toolbar and a new clock will be dropped into the actual middle of your scene (you may need to scroll to see it). When you select and right-click the clock you'll see a new set of controls on the left that let you switch the clock's theme, cycle through clock sizes, and increment/decrement progress on the clock.

## Logic field

Logic field is a json with params which allows to implement some logic when the Item of corresponding type is added or removed.
### Example (from the Vault 1 crew upgrade)
`{"attribute":"data.vault.max","operator":"addition","value":4,"requirement":""}`
- `attribute` - the attribute to affect
- `operator` - what is done to attribute
- `value` - the value for operator
- `requirement` - is not used

### Operators list
- `addition` - is added when item is attached and substracted when removed
- `attribute_change` - changes the "attribute" to value and when removed - uses the "attribute_default" to restore

## Troubleshooting
- If you can't find an item added to your sheet, refer to "All Items" tab on each sheet.

## Credits
- Initial system forked from megastruktur's Blades in the Dark
- Clock UI is adapted from the Clocks module by TyrannosaurusRoy (troygoode) under the MIT license
- This work is based on Scum and Villainy (http://offguardgames.com/scum-and-villainy/), a product of Off Guard Games (https://offguardgames.com/) and designed by John LeBoeuf-Little and Stras Acimovic (expressly approved by Stras).
- Scum and Villainy is based on Blades in the Dark (found at http://www.bladesinthedark.com/), product of One Seven Design, developed and authored by John Harper, and licensed for use under the Creative Commons Attribution 3.0 Unported license (http://creativecommons.org/licenses/by/3.0/).
- Some assets were taken/adapted from here (thank you to timdenee and joesinghaus): https://github.com/joesinghaus/Blades-in-the-Dark


