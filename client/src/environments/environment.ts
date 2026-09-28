/**
 * Single build-time configuration for the deployed prototype.
 *
 * The Angular app currently renders from mock data in src/app/core/mock, so
 * this base URL is not yet used for data reads. It is wired up for the API
 * health probe and is the single place to change when the data layer is
 * migrated to the ASP.NET Core API.
 */
export const environment = {
  production: true,

  /**
   * Origin of the kannimeat-api Docker web service on Render. The hostname is
   * derived from the service name, so this is stable across deploys.
   */
  apiBaseUrl: 'https://kannimeat-api.onrender.com',
};
