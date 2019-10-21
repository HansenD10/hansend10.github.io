import SquidexManager from "./SquidexManager.js";

export default class UIManager {
  constructor(options) {
    // DOM Elements
    this.schemaSelector = document.getElementById('schema-selector');
    this.itemSelector = document.getElementById('item-selector');
    this.itemPreview = document.getElementById('item-preview');

    
    // Initialize Squidex Manager
    this.squidexManager = new SquidexManager(options)
    this.squidexManager.init()
      .then(res => this.init());
  }

  init() {
    // Squidex Field 
    this.squidexField = new SquidexFormField();
    this.initialVal = this.squidexField.getValue();
    this.squidexField.onValueChanged(this.squidexValueChanged.bind(this));

    // Add event listeners for changes
    this.schemaSelector.addEventListener('change', this.setSchemaItems.bind(this));
    this.itemSelector.addEventListener('change', this.setItemsPreview.bind(this));
    
    // Populate schemas options
    this.setSchemas(this.squidexManager.schemas);
  }

  squidexValueChanged(value) {
    if (value && value.codename !== this.schemaSelector.value ) {
      this.schemaSelector.value = value.codename;
      this.setSchemaItems();
    }
    if (value && value.id !== this.itemSelector.value ) {
      this.itemSelector.value = value.id;
      this.setItemsPreview();
    }
  }

  setItemsPreview() {
    // Remove old content
    this.itemPreview.querySelectorAll('li').forEach(item => item.remove());

    // Pass new selected schema to Squidex Field
    this.squidexField.valueChanged({ codename: this.schemaSelector.value, id: this.itemSelector.value });

    // Display all string content
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

    // Pass new selected schema to Squidex Field
    this.squidexField.valueChanged({ codename: this.schemaSelector.value, id: this.itemSelector.value });

    // Populate all available items
    this.squidexManager.getItemsBySchema(this.schemaSelector.value)
      .then(res => {
        console.log('Adding options')
        res.forEach(item => {
          let opt = document.createElement('option');
          opt.appendChild(document.createTextNode(item.id));
          opt.value = item.id;
          this.itemSelector.appendChild(opt);
        })
      });
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