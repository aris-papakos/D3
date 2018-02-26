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
