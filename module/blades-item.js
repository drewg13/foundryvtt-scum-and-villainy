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
    
    // calculates upkeep value from (crew quality + engine quality + hull quality + comms quality + weapons quality) / 4, rounded down
    if (this.actor) {
        upkeep = Math.floor((parseInt(this.actor.data.data.crew) + parseInt(data.systems.engines.value) + parseInt(data.systems.hull.value) + parseInt(data.systems.comms.value) + parseInt(data.systems.weapons.value)) / 4);
        }

    this.actor.data.data.upkeep = upkeep;
        
    this.data.data = data;
}
}
