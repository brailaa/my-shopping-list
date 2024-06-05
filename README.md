# ABOUT

This is a personal project - a basic Shopping List App - I started in order to learn NextJS / ReactJS. It's not intended for commercial use, it's just for practicing tech skills.  
Categories, Products and Archive pages are simple pages with basic functions (create / edit / details).  
Toaster page is for proving all options for a custom toaster class.  
Main page (shopping list) is kind of big and verbose, with many interactive objects... just to see React at work, client and server side.

## Packages used

- [Next.js](https://nextjs.org) 14.2  
- [React](https://react.dev) 18.3  
- [Tailwind CSS](https://tailwindcss.com) 3.4  
- [TypeScript](https://www.typescriptlang.org) 5.4  
- [MySQL2](https://sidorares.github.io/node-mysql2/docs) 3.9  
- [Zod](https://zod.dev/) 3.23
- [pino](https://github.com/pinojs/pino) 9.1 + [pino-pretty](https://github.com/pinojs/pino-pretty) 11.1

## Usage

- first create a `.env` file with all variables needed (see `.env.example`)
- execute `npm run migration` to create the database and the tables
- for running in development mode, use `npm run dev`
- for running in production mode, build with `npm run build` and start with `npm run start`, or simply execute `npm run build:start` to build & start in one step

## DONE

### Pages

- **Shopping List** page
  - [x] create list mode (when no list is found in db)
  - [x] edit list mode (triggered by **Edit** button)
  - [x] archive list action (triggered by **Archive** button)
  - [x] add row mode (triggered by **New row** button)
  - [x] edit row mode (triggered by **Edit row** button)
  - [x] delete row mode (triggered by **Delete row** button)
  - [x] change order action (triggered by the buttons below data table)
  - [x] group by category action (triggered by the checkbox below data table)
  - [x] hide/unhide grouped rows (triggered by caret in the category header)
  - [x] use a sync queue in order to serialize interactive rows actions (maintain actions order, fallback to previous state if an error occurred)
  - [x] wait all actions to complete before edit/delete/add row (in order to have a stable state before initiating a new action)
  - [x] show toaster at success/error
- **Toaster** page
- **Archive** page
  - [x] general view
  - [x] detail view
- **Categories** page
  - [x] general view
  - [x] create
  - [x] edit
  - [x] details
- **404** page
- **Error** page
- **Products** page
  - [x] general view
  - [x] create
  - [x] edit

### Special

- [x] use [Allan Lasser hook for replacing useFormStatus](https://allanlasser.com/posts/2024-01-26-avoid-using-reacts-useformstatus)
- [x] implement a Toaster component for displaying client-side success/error messages
- [x] use Suspense / Skeleton for each page
- [x] use pino for server-side logging
- [x] customize server-side errors
- [x] use zod for safe parsing form data

## TODO

- implement [sensitive data submitting](https://github.com/vercel/next.js/issues/63141)
- Docker setup
