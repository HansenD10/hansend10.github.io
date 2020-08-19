import SquidexManager from './SquidexManager.js';

export default class UIManager {
  constructor(options) {
    this.options = options;
    this.data = [];
    this.form = new SquidexFormField();
    this.form.onInit(this.initializeSquidexManager.bind(this));
  }

  async initializeSquidexManager(ctx) {
    let initialVal = ctx.initialContent ? ctx.initialContent.data.dashboards.iv : null;
    this.formData = initialVal ? initialVal : { dashboards: [] };
    this.squidexManager = new SquidexManager(this.options);
    this.squidexManager.getAuthToken().then(async (accessToken) => {
      this.data = await this.squidexManager.getDashboards(accessToken);
      this.buildDashboardsOptions();
      document.getElementById('dashboard-selector')
        .addEventListener('change', (e) => this.updateValue(e));
    })
    this.form.valueChanged(this.formData);
  }

  updateValue(e) {
    let hasVal = this.formData.dashboards.findIndex(s => s.id == e.target.value) !== -1;

    if (hasVal) this.formData.dashboards = this.formData.dashboards.filter(x => x.id !== e.target.value)
    else this.formData.dashboards.push({ id: e.target.value, name: e.target.id });

    this.form.valueChanged(this.formData);
  }

  buildDashboardsOptions() {
    let dashboardSelector = document.getElementById('dashboard-selector');
    console.log("Before Filter FormData:", this.formData);
    this.formData.dashboards = this.data
      .filter(dashboard => this.formData.dashboards.findIndex(fd => fd.id === dashboard.id) !== -1)
      .map(dashboard => ({ id: dashboard.id, name: dashboard.name }));
    console.log("After Filter FormData:", this.formData);
    this.data.forEach(item => {
      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = item.name;
      checkbox.value = item.id;
      checkbox.id = item.name;

      checkbox.checked = this.formData.dashboards.findIndex(v => v.id === item.id) !== -1;

      let label = document.createElement('label');
      label.htmlFor = item.name;
      label.appendChild(checkbox);
      label.appendChild(document.createElement('span'));
      label.appendChild(document.createTextNode(item.name));

      dashboardSelector.appendChild(label);
    });

    this.setFieldHeight();
  }

  setFieldHeight() {
    let el = document.getElementById('dashboard-selector');
    let height = el.offsetHeight;
    document.body.style.height = (height + 10) + 'px'
  }
}