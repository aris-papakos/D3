# D3 Project


## Project ideas - Brainstorming
One of the datasets we will be given is [this one](https://staff.fnwi.uva.nl/g.strezoski/post/omniart_release/) containing art paintings (and maybe other stuff - not sure about it)



## Layers of visualization ideas

* Per neighborhood (and universal): pie chart of crime types
* Per neighborhood (and universal): Last outcome category (assuming it'll be a finite list) - idea: express categories ranked from high to low according to importance (eg murder -> bike theft)

* On whole map: visualize the move of crimes (possibly seperated by category) over period, since months are given (eg. show transition of bike thefts from one area to another)
* On whole map: show heatmap of certain crime types, especially vehicle/bike related (should I park my bike/car there or better take pub transport?)

* Given a specific route: Have a dot move along the route and as it moves crimes (with diff colors depending on types) pop up around it, for a certain radius.
* After assigning a specific "criminality" score for each neighborhood (according to the number of crimes and their respective severity), we can present some kind of ranking for each neighborhood , when it is selected: e.g. "Area 1: safety rank 13/89", where 89 are all areas of London.


# Installation

## Prerequisites

### Node.JS
Follow instructions on the [Node.js](https://nodejs.org/en/download/package-manager/) website.
### MongoDB (Will be moved online at a later stage)
Follow instructions on the [MongoDB](https://docs.mongodb.com/manual/installation/) website.


## Development server
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.8.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
