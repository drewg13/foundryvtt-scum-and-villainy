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
    //console.log(item_data);


	  if (item_data.type === "faction") {

      this._prepareStatusDefault(data);

    }

  };


  _prepareStatusDefault(data) {

	var status = data.status.value;

	if (this) {
		if ( status == "0" ) { status = 4; };

		data.status.value = status;


	};

  }

}
