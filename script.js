const formContainer = document.querySelector(".form-container");
const form = document.querySelector(".form");
const formInputName = document.querySelector(".form__input--name");
const formInputType = document.querySelector(".form__input--type");
const starWidgets = document.querySelectorAll(".star-widget__input");
const formInputNotes = document.querySelector(".form__input--notes");
const starLabels = document.querySelectorAll(".fa-star");

class Restaurant {
  constructor(name, type, rating, notes) {
    this.name = name;
    this.type = type;
    this.rating = rating;
    this.notes = notes;
  }
}

class App {
  #map;
  #mapEvent;
  #restaurantsArray = [];
  #rating;
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newRestaurant.bind(this));
  }

  _clearForm() {
    formInputName.value = formInputNotes.value = formInputType.value = "";
    starWidgets.forEach((widget) => {
      widget.checked = false;
    });
    formContainer.classList.add("hidden");
  }

  _buildMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const currentLocation = [latitude, longitude];

    this.#map = L.map("map").setView(currentLocation, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._displayForm.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._buildMap.bind(this),
        function () {
          alert("could not get current position");
        }
      );
  }

  _newRestaurant(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const clickLocation = [lat, lng];

    starWidgets.forEach((widget, i) => {
      if (widget.checked) {
        console.log(starWidgets[i].getAttribute("id"));
        if (starWidgets[i].getAttribute("id") === "rate-5") {
          this.#rating = 5;
        }
        if (starWidgets[i].getAttribute("id") === "rate-4") {
          this.#rating = 4;
        }
        if (starWidgets[i].getAttribute("id") === "rate-3") {
          this.#rating = 3;
        }
        if (starWidgets[i].getAttribute("id") === "rate-2") {
          this.#rating = 2;
        }
        if (starWidgets[i].getAttribute("id") === "rate-1") {
          this.#rating = 1;
        }
      }
    });

    // Build a new restaurant
    let restaurant = new Restaurant(
      formInputName.value,
      formInputType.value,
      this.#rating,
      formInputNotes.value
    );

    this.#restaurantsArray.push(restaurant);

    console.log(this.#restaurantsArray);

    const star = '<span><ion-icon name="star-outline"></ion-icon></span>';

    L.marker(clickLocation)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${restaurant.type}-popup`,
        })
      )
      .setPopupContent(
        String(
          `<span>${formInputName.value}</span> <p>${star.repeat(
            this.#rating
          )}</p>`
        )
      )
      .openPopup();
    // L.marker(clickLocation)
    //   .addTo(this.#map)
    //   .bindPopup(
    //     `<p>${formInputName.value}</p> ${star.repeat(5)}`)
    //   .openPopup();

    this._clearForm();

    // Add restaurant to restaurant array

    // Display restaurants to side window
  }

  _displayForm(mapE) {
    this.#mapEvent = mapE;
    formContainer.classList.remove("hidden");
  }
}

const app = new App();
