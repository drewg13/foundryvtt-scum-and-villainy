import { SaVClock } from "./sav-clock.js";
import { log, error } from "./sav-clock-util.js";

const onClick = async () => {
  log('Tool Clicked');
  const clock = new SaVClock();
  const {clientWidth, clientHeight} = document.documentElement;
  const [cx, cy] = [clientWidth / 2, clientHeight / 2];
  const t = canvas.stage.worldTransform;
  const scale = canvas.stage.scale;
  const [vx, vy] = [(cx - t.tx) / scale.x, (cy - t.ty) / scale.y];
  const dim = {
    x: (vx - clock.image.widthTile),
    y: (vy - clock.image.heightTile)
  };

  const tile = new TileDocument({
    img: clock.image.img,
    width: clock.image.widthTile,
    height: clock.image.heightTile,
    x: dim.x,
    y: dim.y,
    z: 900,
    rotation: 0,
    hidden: false,
    locked: false,
    flags: clock.flags
  });

  await canvas.scene.createEmbeddedDocuments("Tile", [tile]);
};

export default {
  getSceneControlButtons: (controls) => {
    const tiles = controls.find((c) => c.name === "tiles");
    tiles.tools.push({
      name: "clocks",
      title: "Clocks",
      icon: "fas fa-clock",
      onClick,
      button: true
    });
  },

  renderTileHUD: async (_hud, html, tileData) => {
    log("Render")
    let t, b, f;
    if( game.majorVersion > 7 ) {
      b = canvas.background.tiles.find( tile => tile.id === tileData._id );
      f = canvas.foreground.tiles.find( tile => tile.id === tileData._id );
      if( b?.id === tileData._id ) {
        t = b;
      } else if ( f?.id === tileData._id ) {
        t = f;
      } else { return false }
    } else {
      t = canvas.tiles.get( tileData._id );
    }
    if (!t?.document?.flags['scum-and-villainy']?.clocks) {
      return;
    }

    const buttonHTML = await renderTemplate('systems/scum-and-villainy/templates/sav-clock-buttons.html');
    html.find("div.left").append(buttonHTML).click(async (event) => {
      log("HUD Clicked")
      // re-get in case there has been an update

      b = canvas.background.tiles.find( tile => tile.id === tileData._id );
      f = canvas.foreground.tiles.find( tile => tile.id === tileData._id );
      if( b?.id === tileData._id ) {
        t = b;
      } else if ( f?.id === tileData._id ) {
        t = f;
      }

      const oldClock = new SaVClock(t.flags['scum-and-villainy']?.clocks);
      let newClock;

      const target = event.target.classList.contains("control-icon")
        ? event.target
        : event.target.parentElement;
      if (target.classList.contains("cycle-size")) {
        newClock = oldClock.cycleSize();
      } else if (target.classList.contains("cycle-theme")) {
        newClock = oldClock.cycleTheme();
      } else if (target.classList.contains("progress-up")) {
        newClock = oldClock.increment();
      } else if (target.classList.contains("progress-down")) {
        newClock = oldClock.decrement();
      } else if (target.dataset.action) {
        return;
      } else {
          return error("ERROR: Unknown TileHUD Button");
      }

      await TileDocument.updateDocuments([{
        _id: t.id,
        img: newClock.image.img,
        flags: newClock.flags
      }], {parent: canvas.scene});
    });
  }
};
