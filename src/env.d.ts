/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
    readonly APP_NAME: string;
    readonly APP_DESCRIPTION: string;
    readonly APP_VERSION: string;
    readonly APP_URL: string;
    readonly API_URL: string;
    readonly API_KEY: string;
    readonly APP_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}