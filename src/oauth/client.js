const fetch = require("node-fetch");

class OAuthClient {
    constructor({
                    oauthOptions
                }) {
        this.options = oauthOptions;
    }

    async getToken() {
        const httpOptions = {
            method: 'POST',
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(this.options.client.id  + ':' + this.options.client.secret).toString('base64')
            },
            body: 'grant_type=client_credentials'
        }
        console.log(httpOptions);

        const response = await fetch(`${this.options.auth.tokenHost}/oauth/token`,httpOptions);
        if(response.status === 200){
            const json = await response.json();
            return json.access_token;
        }

    }


}

module.exports = OAuthClient;