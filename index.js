require("dotenv").config();

const {
  inquirerMenu,
  readInput,
  pause,
  listPlaces,
} = require("./helpers/inquirer");
const Search = require("./models/search");

const main = async () => {
  const search = new Search();
  let opt;
  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        // Mostrar mensaje
        const searchItem = await readInput("City: ");

        // Buscar los lugares
        const places = await search.city(searchItem);

        // Seleccionar el lugar
        const placeId = await listPlaces(places);
        if (placeId === "0") continue;

        const selectedPlace = places.find((place) => place.id === placeId);
        const { name, lat, lng } = selectedPlace;

        // Guardar en DB
        search.addHistoric(name);

        // Datos de clima
        const weather = await search.placeWeather(lat, lng);
        const { temp, min, max, desc } = weather;

        // Mostrar resultados
        console.clear();
        console.log("\nCity information\n".green);
        console.log("City:", name.cyan);
        console.log("Lat:", lat);
        console.log("Lng:", lng);
        console.log("Temperature:", temp);
        console.log("Min:", min);
        console.log("Max:", max);
        console.log("Description:", desc.magenta);
        break;

      case 2:
        search.capitalizeHistoric.forEach((place, index) => {
          const idx = `${index + 1}.`.green;
          console.log(`${idx} ${place}`);
        });
        break;
      default:
        break;
    }
    if (opt !== 0) await pause();
  } while (opt !== 0);
};

main();
