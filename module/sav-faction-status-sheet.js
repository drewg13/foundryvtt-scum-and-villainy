import { SaVSheet } from "./sav-sheet.js";

/**
 * @extends {SaVSheet}
 */
export class SaVFactionStatusSheet extends SaVSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["scum-and-villainy", "sheet", "actor", "fs-faction-dialog"],
      template: "systems/scum-and-villainy/templates/faction-status-sheet.hbs",
      width: 1280,
      height: "auto",
      resizable: false,
      tabs: [{ navSelector: ".tabs", contentSelector: ".tab-content" }],
    });
  }

  /** @override */
  async getData(options) {
    const superData = super.getData(options);
    const sheetData = superData.data;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;
    sheetData.isGM = game.user.isGM;

    sheetData.system.description = await TextEditor.enrichHTML(
      sheetData.system.description,
      { secrets: sheetData.owner, async: true }
    );

    let total = 0;
    sheetData.items.forEach((i) => {
      if (i.type === "star_system") {
        total += 1;
      }
    });
    sheetData.totalSystems = total;
    sheetData.items.sort(
      (a, b) => parseInt(b.system.tier) - parseInt(a.system.tier)
    );
    return sheetData;
  }

  /** @override */
  // a seperate copy of the add function

  async addItemsToSheet(item_type, el) {
    //el is the list of items to add
    let items = await SaVHelpers.getAllItemsByType(item_type, game);
    let items_to_add = [];

    el.find("div.new-item input:checked").each(function () {
      items_to_add.push(items.find((e) => e._id === $(this).val()));
    });

    //seems like system.status.value is an array???
    /*
    items_to_add.forEach((obj) => {
      obj.system.status.value = [4];
    });
    */
    if (this.actor.isOwner) {
      await Item.create(items_to_add, { parent: this.document });
    }
  }
  //flags too?
  async addFlagsToSheet(item_type, el) {
    let items = await SaVHelpers.getAllActorsByType(item_type, game);
    let items_to_add = [];

    el.find("input:checked").each(function () {
      items_to_add.push(items.find((e) => e.id === $(this).val()));
    });

    if (this.actor.isOwner) {
      await this.actor.setFlag("scum-and-villainy", item_type, items_to_add);
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find(".fs-item-body").click((ev) => {
      const element = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(element.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click(async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
      element.slideUp(200, () => this.render(false));
    });

    // Post item to chat
    html.find(".item-post").click((ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sendToChat();
    });

    // Modify player visibility
    html.find(".item-visible").click(async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      const itemVisible = !item.system.visible;
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: item.id, system: { visible: itemVisible } },
      ]);
    });

    // increase faction status
    html.find(".faction-up").click(async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      //console.dir (element);
      //console.dir (item);
      const statusUpdate = item.system.status;
      if (statusUpdate.value < statusUpdate.max) {
        statusUpdate.value++;
      }
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: item.id, system: { status: statusUpdate } },
      ]);
    });

    // decrease faction status
    html.find(".faction-down").click(async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      const statusUpdate = item.system.status;
      if (statusUpdate.value > 1) {
        statusUpdate.value--;
      }
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: item.id, system: { status: statusUpdate } },
      ]);
    });

    // increase faction jobs
    html.find(".jobs-up").click(async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      const jobsUpdate = item.system.jobs;
      if (jobsUpdate.value < jobsUpdate.max) {
        jobsUpdate.value++;
      }
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: item.id, system: { jobs: jobsUpdate } },
      ]);
    });

    // decrease faction status
    html.find(".jobs-down").click(async (ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      const jobsUpdate = item.system.jobs;
      if (jobsUpdate.value > 0) {
        jobsUpdate.value--;
      }
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: item.id, system: { jobs: jobsUpdate } },
      ]);
    });
  }
}
