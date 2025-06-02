interface Auth0Config {
  domain: string;
  clientId: string;
  audience: string;
  redirectUri: string;
}

export const auth0Config: Auth0Config = {
  domain: "dev-jewoi3myj56ypvrl.us.auth0.com", // Replace with your Auth0 domain
  clientId: "ZByGSZ2ozCTIGZ3xjdOGx4HGSsZBFUYj", // Replace with your Auth0 client ID
  redirectUri: window.location.origin,
  audience: "https://dev-jewoi3myj56ypvrl.us.auth0.com/api/v2/" // Cambiado para coincidir con tu API
}; 