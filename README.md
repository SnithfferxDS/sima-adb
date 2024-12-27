# SIMA-AstroDB

A Modular and simple imported products inventory and management application using Astro framework and Astro DB.
For more information visit [Bytes4Run.com](https://bytes4run.com/projects/sipima).

## Content table

- [SIPIMA](#sima-astrodb)
  - [Content table](#content-table)
  - [Prerequisites](#prerequisites)
  - [Getting the Project](#getting-the-project)
  - [Configuring the Project](#configuring-the-project)
  - [Technologies](#technologies)

## Prerequisites

- TypeScript 5 o JavaScript
- Nodejs 18 or higher (20 recomended)
- Git updated

## Getting the Project

To get the project, you can clone or fork this repository, install dependencies using any package manager like npm or yarn (recomended bun).

## Configuring the Project

Make sure you have a .env file in your application root directory, if you does not had one, copy the "_.env.example_" file and rename it to ".env". Add your database user and password, and if you use turso add the token.

## Technologies

- **[JS](http://www.javascript.com)**
- **[HTML](http://ww3.school.com)**
- **[TypeScript](https://www.typescriptlang.org/)**

## 🚀 Project Structure

```sh
├── db
│   ├── config.ts # database schema
│   ├── database.db # local database
│   └── seed.ts # seed for database
├── dist
├── public
│   └── assets
│       ├── img
│       │   ├── app_icons
│       │   └── logos
│       └── plugins
├── src
│   ├── actions
│   ├── assets  # for static 
│   ├── components
│   ├── configs
│   ├── lib
│   ├── layouts
│   ├── middleware
│   ├── pages
│   ├── storage
│   ├── templates
│   └── types
├── .editorconfig
├── .env.example
├── astro.config.mjs
├── packagae.json
├── README.md
├── tailwind.config.mjs
└── tsconfig.json
```

## Credits

- Author: Jorge Echeverria.
- Contact: [jecheverria@bytes4run.com](mailto:jecheverria@bytes4run.com)
- Website: [bystes4run](https://bytes4run.com)
- Theme: Bytes4Run base on flowbite
- Version: 2.0.0 a.r1
- Short-version: 2.0
