const nextIndexInArray = (arr, el) => {
  const idx = arr.indexOf(el);
  return (idx < 0 || idx >= arr.length) ? 0 : idx + 1;
}

export class Clock {
  static get sizes () {
      return [4, 6, 8, 10, 12];
  }

  static get themes () {
    return ["default", "red", "yellow", "green"];
  }

  constructor ({ theme, size, progress } = {}) {
    const isSupportedSize = size && Clock.sizes.indexOf(parseInt(size)) >= 0;
    this._size = isSupportedSize ? parseInt(size) : Clock.sizes[0];

    const p = (!progress || progress < 0) ? 0 : progress < this._size ? progress : this._size;
    this._progress = p || 0;

    this._theme = theme || Clock.themes[0];
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
      clocks: {
        theme: this._theme,
        size: this._size,
        progress: this._progress
      }
    };
  }

  cycleSize () {
    return new Clock({
      theme: this.theme,
      size: Clock.sizes[nextIndexInArray(Clock.sizes, this.size)],
      progress: this.progress
    });
  }

  cycleTheme () {
    return new Clock({
      theme: Clock.themes[nextIndexInArray(Clock.themes, this.theme)],
      size: this.size,
      progress: this.progress
    });
  }

  increment () {
    const old = this;
    return new Clock({
      theme: old.theme,
      size: old.size,
      progress: old.progress + 1
    });
  }

  decrement () {
    const old = this;
    return new Clock({
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
