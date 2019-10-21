export default class SquidexManager {
  constructor(options) {
    this.authOptions = options;
    this.authToken;
  }

  init() {
    return new Promise(async (resolved, rejected) => {
      // Get Squidex auth token
      await this.getAuthToken()
        .then(res => res.json())
        .then(res => this.authToken = res);

      // Timeout for new token
      this.getNewAuthToken();

      // Get Schemas
      await this.getSchemas()
        .then(res => res.json())
        .then(res => {
          this.schemas = res.items.map(item => ({ label: item.properties.label, codename: item.name }))
          return resolved();
        });
    })
  }

  getNewAuthToken() {
    setTimeout(() => {
      this.getAuthToken()
        .then(res => res.json())
        .then(res => {
          this.authToken = res;
          this.getNewAuthToken();
        });
    }, this.authToken.expires_in);
  }

  getAuthToken() {
    let { appName, clientId, clientSecret } = this.authOptions;
    
    let formData = new FormData();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', `${appName}:${clientId}`);
    formData.append('client_secret', clientSecret);
    formData.append('scope', 'squidex-api');

    return fetch('https://cloud.squidex.io/identity-server/connect/token', {
      method: 'POST',
      body: formData
    });
  }

  getSchemas() {
    let { access_token, token_type } = this.authToken;
    let { appName } = this.authOptions;

    return fetch(`https://cloud.squidex.io/api/apps/${appName}/schemas`, {
      headers: { 
        Authorization: `${token_type} ${access_token}`
      }
    });
  }

  getItemsBySchema(schema) {
    return new Promise(async (resolved, rejected) => {
      let { access_token, token_type } = this.authToken;
      let { appName } = this.authOptions;

      return await fetch(`https://cloud.squidex.io/api/content/${appName}/${schema}`, {
        headers: {
          Authorization: `${token_type} ${access_token}`
        }
      })
        .then(res => res.json())
        .then(res => this.schemaItems = res.items)
        .then(res => resolved(this.schemaItems));
    })
  }
}