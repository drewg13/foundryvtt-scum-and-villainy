const nextIndexInArray = (arr, el) => {
  const idx = arr.indexOf(el);
  return (idx < 0 || idx >= arr.length) ? 0 : idx + 1;
}

export class SaVClock {
  static get sizes () {
      return [4, 6, 8, 10, 12];
  }

  static get themes () {
	  const default_t = game.system.savclocks.choices[ game.settings.get( "scum-and-villainy", "defaultClockTheme" ) ];
	  let curr_t = game.system.savclocks.choices;

	  if ( curr_t.indexOf( default_t ) !== 0 ) {
		  curr_t = curr_t.filter( x => x !== default_t );
	  	curr_t.unshift( default_t );
	  }

	  return curr_t;
  }

  constructor ({ theme, size, progress } = {}) {
    const isSupportedSize = size && SaVClock.sizes.indexOf(parseInt(size)) >= 0;
    this._size = isSupportedSize ? parseInt(size) : SaVClock.sizes[0];

    const p = (!progress || progress < 0) ? 0 : progress < this._size ? progress : this._size;
    this._progress = p || 0;

    this._theme = theme || SaVClock.themes[0];
  }

  get theme () {
    return this._theme;
  }

  get size () {
    return this._size;
  }

  get progress () {
    return this._progress;
  }

  get image () {
    return {
      img: `/systems/scum-and-villainy/themes/${this.theme}/${this.size}clock_${this.progress}.webp`,
      widthTile: 200,
      heightTile: 200,
	    widthSheet: 350,
	    heightSheet: 350
    };
  }

  get flags () {
    return {
      "scum-and-villainy": {
	    clocks: {
          theme: this._theme,
          size: this._size,
          progress: this._progress
        }
	  }
    };
  }

  cycleSize () {
    return new SaVClock({
      theme: this.theme,
      size: SaVClock.sizes[nextIndexInArray(SaVClock.sizes, this.size)],
      progress: this.progress
    });
  }

  cycleTheme () {
    return new SaVClock({
      theme: SaVClock.themes[nextIndexInArray(SaVClock.themes, this.theme)],
      size: this.size,
      progress: this.progress
    });
  }

  increment () {
    const old = this;
    return new SaVClock({
      theme: old.theme,
      size: old.size,
      progress: old.progress + 1
    });
  }

  decrement () {
    const old = this;
    return new SaVClock({
      theme: old.theme,
      size: old.size,
      progress: old.progress - 1
    });
  }

  isEqual (clock) {
    return clock
      && clock._progress === this._progress
      && clock._size === this._size
      && clock._theme === this._theme;
  }

  toString () {
    return `${this._progress}/${this._size} • ${this._theme}`;
  }
}
