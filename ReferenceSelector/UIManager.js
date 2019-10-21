import SquidexManager from "./SquidexManager.js";

export default class UIManager {
  constructor(options) {
    this.schemaSelector = document.getElementById('schema-selector');
    this.itemSelector = document.getElementById('item-selector');
    this.itemPreview = document.getElementById('item-preview')
    this.squidexManager = new SquidexManager(options)
    this.squidexManager.init()
      .then(res => this.init());
  }

  init() {
    this.schemaSelector.addEventListener('change', this.setSchemaItems.bind(this));
    this.itemSelector.addEventListener('change', this.setItemsPreview.bind(this));
    this.setSchemas(this.squidexManager.schemas);
  }

  setItemsPreview() {
    this.itemPreview.querySelectorAll('li').forEach(item => item.remove());
    this.squidexManager.schemaItems.forEach(item => {
      let { data } = item;
      Object.keys(data).forEach(prop => {
        if (!(data[prop].iv instanceof Array) && data[prop].iv) {
          this.itemPreview.insertAdjacentHTML('beforeend', `<li><b>${prop}</b>: ${data[prop].iv}</li>`);
        }
      })
    })
  }

  setSchemaItems() {
    //Remove old items
    this.itemSelector.querySelectorAll('option').forEach(item => {
      item.getAttribute('value') && item.remove();
    })
    this.squidexManager.getItemsBySchema(this.schemaSelector.value)
      .then(res => {
        res.forEach(item => {
          let opt = document.createElement('option');
          opt.appendChild(document.createTextNode(item.id));
          opt.value = item.id;
          this.itemSelector.appendChild(opt);
        })
      })
  }

  setSchemas(schemas) {
    schemas.forEach(item => { 
      let opt = document.createElement('option');
      opt.appendChild(document.createTextNode(item.label ? item.label : item.codename));
      opt.value = item.codename;
      this.schemaSelector.appendChild(opt);
    })
  }
}