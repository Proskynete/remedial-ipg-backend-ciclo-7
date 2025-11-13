/**
 * Configuration interface for the application
 * Defines all environment variables and configuration options
 */
export interface Config {
  port: string;
  base_url: string;
  jwt: {
    secret: string;
    expire: string;
  };
  database_url: string;
}
