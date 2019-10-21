import SquidexManager from "./SquidexManager.js";

export default class UIManager {
  constructor(options) {
    this.options = options;
    this.formData = { codename: "", id: "" };
    this.data = { schemas: [], items: [] };
    this.form = new SquidexFormField();
    this.form.onInit(this.initializeSquidexManager.bind(this));
  }

  async initializeSquidexManager(ctx) {
    let { access_token, token_type } = ctx.user.user;
    this.options.accessToken = access_token;
    this.options.tokenType = token_type;

    this.squidexManager = new SquidexManager(this.options);
    this.data.schemas = await this.squidexManager.getSchemas();
    this.buildSchemas();
    this.form.onValueChanged(val => this.squidexValueChanged(val));
    document.getElementById('schema-selector')
      .addEventListener('change', this.updateValue.bind(this, true))
    document.getElementById('item-selector')
      .addEventListener('change', this.updateValue.bind(this, false));
  }

  updateValue(isSchema, e) {
    let val = { 
      codename: isSchema ? e.target.value : this.formData.codename,
      id: isSchema ? '' : e.target.value
    }

    this.form.valueChanged(val);
    this.squidexValueChanged(val);
  }

  async squidexValueChanged(val) {
    if (val.codename && this.formData.codename !== val.codename) { 
      this.data.items = await this.squidexManager.getItemsBySchema(val.codename);
      document.getElementById('schema-selector')
        .querySelectorAll('option').forEach(item => item.selected = item.value === val.codename);
      this.buildItems(val.id);
    }
    this.buildItemPreview(val.id);
    this.formData = val;
  }

  buildItemPreview(selectedId) {
    let itemPreview = document.getElementById('item-preview')
    itemPreview.querySelectorAll('li').forEach(item => item.remove());

    if (!selectedId) return;

    let selectedItem = this.data.items.filter(x => x.id === selectedId)[0];

    let { data } = selectedItem;
    Object.keys(data).forEach(key => {
      if (!(data[key].iv instanceof Array) && data[key].iv)
        itemPreview.insertAdjacentHTML('beforeend', `<li><b>${key}</b>: ${data[key].iv}</li>`);
    });
  }

  buildItems(id) {
    let itemSelector = document.getElementById('item-selector');

    itemSelector.querySelectorAll('option').forEach(item => {
      item.getAttribute('value') && item.remove();
    })

    this.data.items.forEach(item => {
      let opt = document.createElement('option');
      opt.label = item.id;
      opt.value = item.id;
      opt.selected = item.id === id;
      itemSelector.appendChild(opt);
    })
  }

  buildSchemas() {
    let schemaSelector = document.getElementById('schema-selector');
    
    this.data.schemas.forEach(item => {
      let opt = document.createElement('option');
      opt.label = item.label ? item.label : item.codename;
      opt.value = item.codename;
      schemaSelector.appendChild(opt);
    })
  }

}