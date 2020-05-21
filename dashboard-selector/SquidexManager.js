export default class SquidexManager {
  constructor(options) {
    this.options = options;

    this.getDashboards = this.getDashboards.bind(this);
    this.getAuthToken = this.getAuthToken.bind(this);
  }

  getDashboards(accessToken) {
    let { squidexUrl, appName } = this.options;

    return new Promise((resolve, reject) => {
      fetch(`${squidexUrl}/api/content/${appName}/dashboard`, {
        headers: {
          Authorization: accessToken
        }
      })
      .catch(err => reject(err))
      .then(res => res.json())
      .then(res => resolve(res.items.map(item => ({name: item.data.name.iv, id: item.id}))));
    });
  }

  getAuthToken() {
    let { squidexUrl, appName, clientId, clientSecret } = this.options;

    let formData = new FormData;
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', appName + ':' + clientId);
    formData.append('client_secret', clientSecret);
    formData.append('scope', 'squidex-api')

    return new Promise((resolve, reject) => {
      fetch(`${squidexUrl}/identity-server/connect/token`, {
        method: 'POST',
        body: formData,
      })
      .catch(err => reject(err))
      .then(res => res.json())
      .then(res => resolve(`${res.token_type} ${res.access_token}`));
    });
  }
}