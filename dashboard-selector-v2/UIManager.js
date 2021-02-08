import SquidexManager from './SquidexManager.js';

export default class UIManager {
  constructor(options) {
    this.options = options;
    this.data = [];
    this.form = new SquidexFormField();
    this.form.onInit(this.initializeSquidexManager.bind(this));
  }

  async initializeSquidexManager(ctx) {
    this.formData = {
      dashboards: ctx.initialContent?.data?.dashboards?.iv?.dashboards ?? [],
      defaultDashboard: ctx.initialContent?.data?.dashboards?.iv?.defaultDashboard ?? '',
    };
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

    if (hasVal) {
      this.formData.dashboards = this.formData.dashboards.filter(x => x.id !== e.target.value);
      document.querySelector(`input[value="${e.target.value}"] ~ button`).style.visibility = 'hidden';
    }
    else {
      this.formData.dashboards.push({ id: e.target.value, name: e.target.id });
      document.querySelector(`input[value="${e.target.value}"] ~ button`).style.visibility = 'visible';
    }
    
    this.form.valueChanged(this.formData);
  }

  handleDefaultClick(dashboardId) {
    let defaultDash = document.querySelector(`input[value="${dashboardId}"] ~ button`)
    let isSelected = this.formData.defaultDashboard === dashboardId;

    this.formData.defaultDashboard = isSelected ? null : dashboardId;

    document.querySelectorAll("input ~ button").forEach(node => {
      node.style.visibility = isSelected ? 'visible' : 'hidden';
      node.classList.remove('active');
    });
    
    if (!isSelected) {
      defaultDash.style.visibility = 'visible';
      defaultDash.innerText = 'Default Dashboard';
      defaultDash.classList.add('active');  
    } else {
      defaultDash.innerText = 'Make Default Dashboard';
    }
    console.log(this.formData);
  }

  buildDashboardsOptions() {
    let dashboardSelector = document.getElementById('dashboard-selector');
    this.formData.dashboards = this.data
      .filter(dashboard => this.formData.dashboards.findIndex(fd => fd.id === dashboard.id) !== -1)
      .map(dashboard => ({ id: dashboard.id, name: dashboard.name }));

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

      let setDefaultDashBtn = document.createElement('button');
      setDefaultDashBtn.innerText = 'Make Default Dashboard';
      setDefaultDashBtn.type = 'button';
      setDefaultDashBtn.addEventListener('click', (e) => this.handleDefaultClick(item.id));
      setDefaultDashBtn.style.visibility = checkbox.checked ? 'visible' : 'hidden';
      label.appendChild(setDefaultDashBtn);

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