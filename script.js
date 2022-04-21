"use strict";

const formContainer = document.querySelector(".form-container");
const formInputName = document.querySelector(".form__input--name");
const formInputType = document.querySelector(".form__input--type");
const starWidgets = document.querySelectorAll(".star-widget__input");
const formTextArea = document.querySelector(".form__text-area");
const form = document.querySelector(".form");

class Restaurant {
  date = new Date();
  id = String(Date.now()).slice(-10);

  constructor(name, type, rating, notes) {
    this.name = name;
    this.type = type;
    this.rating = rating;
    this.notes = notes;
  }
}

const tonyB = new Restaurant(`tonyB`, `pizza`, 5, `yes`);
console.log(tonyB);

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newRestaurant.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("could not get position");
        }
      );
  }

  _loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    formContainer.classList.remove("hidden");
    formInputName.focus();
  }

  _newRestaurant(e) {
    e.preventDefault();
    formInputName.value = formInputType.value = formTextArea.value = "";
    starWidgets.forEach((widget) => {
      widget.checked = false;
    });
    const lat = this.#mapEvent.latlng.lat;
    const lng = this.#mapEvent.latlng.lng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Restaurant")
      .openPopup();
    formContainer.classList.add("hidden");
  }
}

const app = new App();
