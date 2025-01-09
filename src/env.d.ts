/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
    readonly APP_NAME: string;
    readonly APP_DESCRIPTION: string;
    readonly APP_VERSION: string;
    readonly APP_URL: string;
    readonly APP_KEY: string;
    readonly APP_AUTHOR: string;
    readonly APP_FULL_NAME: string;
    readonly APP_SHORT_VERSION: number;
    readonly APP_LANGUAGE: string;
    readonly APP_TIMEZONE: string;
    readonly APP_DATE_FORMAT: string;
    readonly APP_TIME_FORMAT: string;
    readonly APP_DEBUG: boolean;
    readonly APP_LOGO: string;
    readonly APP_LOGO_MINI: string;
    readonly APP_HOST_NAME: string;
    readonly APP_HOST_PORT: number;
    readonly APP_HOST_DOMAIN: string;
    readonly APP_REDIRECT_URI: string;
    readonly APP_AUTH: boolean;
    readonly APP_DEFAULT_MODULE: string;
    readonly APP_DEFAULT_CONTROLLER: string;
    readonly APP_DEFAULT_METHOD: string;
    readonly API_URL: string;
    readonly API_KEY: string;
    readonly API_VERSION: number;
    readonly API_DEBUG: boolean;
    readonly API_TOKEN: string;
    readonly APP_SMTP_HOST: string;
    readonly APP_SMTP_PORT: string;
    readonly APP_SMTP_USER: string;
    readonly APP_SMTP_PASS: string;
    readonly APP_SMTP_MAIL: string;
    readonly SHOPIFY_DB_URL: string;
    readonly SHOPIFY_DB_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}