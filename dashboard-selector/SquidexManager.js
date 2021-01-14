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
          Authorization: accessToken,
        }
      })
      .catch(err => reject(err))
      .then(res => res.json())
      .then(res => resolve(res.items.map(item => ({name: item.data.name.iv, id: item.id}))));
    });
  }

  getAuthToken() {
    let { squidexUrl, appName, clientId, clientSecret } = this.options;
    let formBody = [];
    var postData = {
      'grant_type': 'client_credentials',
      'client_id': appName + ':' + clientId,
      'client_secret': clientSecret,
      'scope': 'squidex-api',
    }

    for (let prop in postData) {
      let encodedKey = encodeURIComponent(prop);
      let encodedValue = encodeURIComponent(postData[prop]);
      formBody.push(encodedKey + '=' + encodedValue);
    }

    // let formData = new FormData;
    // formData.set('grant_type', 'client_credentials');
    // formData.set('client_id', appName + ':' + clientId);
    // formData.set('client_secret', clientSecret);
    // formData.set('scope', 'squidex-api')

    return new Promise((resolve, reject) => {
      fetch(`${squidexUrl}/identity-server/connect/token`, {
        method: 'POST',
        body: formBody.join('&'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .catch(err => reject(err))
      .then(res => res.json())
      .then(res => resolve(`${res.token_type} ${res.access_token}`));
    });
  }
}