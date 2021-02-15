const fs = require("fs");
const axios = require("axios");
const capitalize = require("capitalize");

class Search {
  historic = [];
  dbPath = "./db/database.json";

  constructor() {
    // TODO: leer DB si existe
    this.readDB();
  }

  get capitalizeHistoric() {
    return this.historic.map((place) => {
      return capitalize.words(place);
    });
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async city(place = "") {
    try {
      // Petición http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
        params: this.paramsMapbox,
      });
      const resp = await instance.get();
      return resp.data.features.map((place) => ({
        id: place.id,
        name: place.place_name,
        lng: place.center[0],
        lat: place.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  async placeWeather(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: "http://api.openweathermap.org/data/2.5/weather",
        params: { ...this.paramsOpenWeather, lat, lon },
      });
      const resp = await instance.get();
      const {
        weather: [{ description: desc }],
        main: { temp, temp_min: min, temp_max: max },
      } = resp.data;
      return {
        temp,
        min,
        max,
        desc,
      };
    } catch (error) {
      console.log(error);
    }
  }

  addHistoric(place = "") {
    // TODO: prevenir duplicados
    if (this.historic.includes(place.toLowerCase())) {
      return;
    }
    this.historic = this.historic.splice(0, 5);

    this.historic.unshift(place.toLowerCase());

    // Grabar en DB
    this.saveDB();
  }

  saveDB() {
    const payload = {
      historic: this.historic,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  readDB() {
    if (!fs.existsSync(this.dbPath)) {
      return;
    }
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const { historic } = JSON.parse(info);
    this.historic = [...historic];
  }
}

module.exports = Search;
