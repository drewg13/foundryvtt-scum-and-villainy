/**
 * Extend the basic Item
 * @extends {Item}
 */
export class BladesItem extends Item {

  /* override */
  prepareData() {

    super.prepareData();
    
    const item_data = this.data;
    const data = item_data.data;

    if (item_data.type === "crew_type") {
    
      this._prepareUpkeep(data);
    
    }
  }

  /**
   * Prepares Upkeep data
   *
   * @param {object} data 
   */
  _prepareUpkeep(data) {

    let upkeep = 0;
    
    // Adds Scale and Quality
    if (this.actor) {
        upkeep = floor((parseInt(this.actor.data.data.crew) + parseInt(this.data.data.systems.engines.value) + parseInt(this.data.data.systems.hull.value) + parseInt(this.data.data.systems.comms.value) + parseInt(this.data.data.systems.weapons.value)) / 4);
        }

    this.actor.data.data.upkeep = upkeep;
        
    this.data.data = data;
}
}
