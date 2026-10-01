# Отчество

A small, dependency-free Russian patronymic builder. Enter a father's given name
and the app returns the masculine and feminine patronymics, including accepted
alternative spellings when the dictionary contains them.

## Run locally

```sh
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Development

The browser application uses native ES modules. Its dictionary module is generated
from the tab-separated source data so there is only one source of truth:

```sh
npm run build   # regenerate src/patronymics-data.js
npm test        # run the API tests
npm run check   # syntax-check the browser modules
```

## API

```js
import { buildPatronymics } from "./src/patronymics.js";

buildPatronymics("Илья");
// { name: "Илья", masculine: ["Ильич"], feminine: ["Ильинична"], exact: true }
```

The bundled dictionary is preferred. For an unfamiliar name, a conservative set
of productive Russian suffix rules supplies a clearly identified suggestion.
