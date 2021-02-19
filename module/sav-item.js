/**
 * Extend the basic Item
 * @extends {Item}
 */
export class SaVItem extends Item {

  /* override */
  prepareData() {

    super.prepareData();
    
    const item_data = this.data;
    const data = item_data.data;

		
	
    if (item_data.type === "crew_type") {
    
      this._prepareUpkeep(data);
    
    }
	
	if (item_data.type === "faction") {
    
      this._prepareStatusDefault(data);
    
    }
	
  }

  /**
   * Prepares Upkeep data
   *
   * @param {object} data 
   */
  _prepareUpkeep(data) {

    let upkeep = 0;
    
    
    if (this.actor) {
    
		// calculates upkeep value from (crew quality + engine quality + hull quality + comms quality + weapons quality) / 4, rounded down
		upkeep = Math.floor((parseInt(this.actor.data.data.systems.crew.value) + parseInt(this.actor.data.data.systems.engines.value) + parseInt(this.actor.data.data.systems.hull.value) + parseInt(this.actor.data.data.systems.comms.value) + parseInt(this.actor.data.data.systems.weapons.value)) / 4);
    
		this.actor.data.data.systems.upkeep.value = upkeep;
	
	};

            
    this.data.data = data;
  }
  
  _prepareStatusDefault(data) {
	
	var status = data.status.value;
	
	if (this) {
		if ( status == "0" ) { status = 4; };
	
		data.status.value = status;
		
		
	};
	
	this.data.data = data;
	
  }
  
}
