export default class SquidexManager {
  constructor(options) {
    this.options = options;
  }

  getSchemas() {
    let { appName, accessToken, tokenType, allowedSchemas } = this.options;

    return new Promise((resolved, rejected) => {
      fetch(`https://cloud.squidex.io/api/apps/${appName}/schemas`, {
        headers: { 
          Authorization: `${tokenType} ${accessToken}`
        }
      })
      .then(res => res.json())
      .then(res => {
        let schemaArray = allowedSchemas ? allowedSchemas.split(',') : undefined;
        console.log(schemaArray);
        resolved(res.items.reduce((items, item) => {
          if (!schemaArray || schemaArray.includes(item.name))
            items.push({ codename: item.name, label: item.properties.label });
            return items;
        }, []))
      })
      .catch(err => rejected("Failed to fetch schemas"));
    });
  }

  getItemsBySchema(schema) {
    return new Promise(async (resolved, rejected) => {
      let { accessToken, tokenType, appName } = this.options;

      return await fetch(`https://cloud.squidex.io/api/content/${appName}/${schema}`, {
          headers: {
            Authorization: `${tokenType} ${accessToken}`
          }
        })
        .then(res => res.json())
        .then(res => resolved(res.items));
    })
  }
}