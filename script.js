const formContainer = document.querySelector(".form-container");
const form = document.querySelector(".form");
const formInputName = document.querySelector(".form__input--name");
const formInputType = document.querySelector(".form__input--type");
const starWidgets = document.querySelectorAll(".star-widget__input");
const formInputNotes = document.querySelector(".form__input--notes");
const starLabels = document.querySelectorAll(".fa-star");
const bookmarkIcon = document.querySelector(".bookmark-icon");
const sidebar = document.querySelector(".sidebar");
const sidebarRestaurantsContainer = document.querySelector(
  ".sidebar__restaurants-container"
);
const sidebarCloseButton = document.querySelector(".sidebar__close-button");
const application = document.querySelector(".application");

class Restaurant {
  id = (Date.now() + "").slice(-10);
  clicks = 0;
  star = "<span>⭐</span>";
  constructor(name, type, rating, notes, coords) {
    this.name = name;
    this.type = type;
    this.rating = rating;
    this.notes = notes;
    this.coords = coords;
  }

  click() {
    this.clicks++;
  }
}

class App {
  #map;
  #mapEvent;
  #restaurantsArray = [];
  #rating;
  star = "<span>⭐</span>";
  #markerArray = [];
  constructor() {
    this._getPosition();

    this._getLocalStorage();

    form.addEventListener("submit", this._newRestaurant.bind(this));
    bookmarkIcon.addEventListener("click", this._toggleSidebar.bind(this));
    sidebarCloseButton.addEventListener(
      "click",
      this._toggleSidebar.bind(this)
    );
    sidebarRestaurantsContainer.addEventListener(
      "click",
      this._moveToMarker.bind(this)
    );
    sidebarRestaurantsContainer.addEventListener(
      "click",
      this._deleteRestaurant.bind(this)
    );
  }

  _deleteRestaurant(e) {
    if (e.target.classList.contains("restaurant__icon__trash")) {
      const restaurantEl = e.target.closest(".restaurant");
      const restaurant = this.#restaurantsArray.find(
        (el) => el.id === restaurantEl.dataset.id
      );
      const restaurantMarker = this.#markerArray.find(
        (el) => el.id === restaurantEl.dataset.id
      );
      const index = this.#restaurantsArray.indexOf(restaurant);
      this.#restaurantsArray.splice(index, 1);
      restaurantEl.remove();
      this.#map.removeLayer(restaurantMarker);
      this._setLocalStorage();
    }
  }

  _moveToMarker(e) {
    if (e.target.classList.contains("restaurant__icon__nav")) {
      this._toggleSidebar();
      const restaurantEl = e.target.closest(".restaurant");
      console.log(restaurantEl);

      const restaurant = this.#restaurantsArray.find(
        (el) => el.id === restaurantEl.dataset.id
      );

      this.#map.setView(restaurant.coords, 13, {
        animate: true,
        pan: {
          duration: 1,
        },
      });
    }
  }

  _toggleSidebar() {
    sidebar.classList.toggle("translate");
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

    this.#restaurantsArray.forEach((restaurant) => {
      this._renderRestaurantMarker(restaurant);
    });
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._buildMap.bind(this),
        function () {
          alert("could not find your location");
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
      formInputNotes.value,
      [lat, lng]
    );

    this.#restaurantsArray.push(restaurant);

    this._newRestaurantFile(restaurant);

    this._renderRestaurantMarker(restaurant);

    this._clearForm();

    this._setLocalStorage();
  }

  _renderRestaurantMarker(restaurant) {
    const marker = new L.Marker(restaurant.coords);
    this.#map.addLayer(marker);
    marker
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${restaurant.type}-popup`,
        })
      )
      .setPopupContent(
        String(
          `<span>${restaurant.name}</span> <p>${this.star.repeat(
            restaurant.rating
          )}</p>`
        )
      )
      .openPopup();
    marker.id = restaurant.id;
    this.#markerArray.push(marker);
  }

  _newRestaurantFile(restaurant) {
    let html = `
    <div class="restaurant" data-id="${restaurant.id}">
      <div class="restaurant__header">
        <h1 class="restaurant__title">${restaurant.name}</h1>
        <div class="restaurant__icon-container">
          <ion-icon class="restaurant__icon restaurant__icon__nav" name="navigate-outline"></ion-icon>
          <ion-icon class="restaurant__icon restaurant__icon__trash" name="trash-outline"></ion-icon> 
        </div>
      </div>
      <div class="restaurant__information">
        <div class="restaurant__information__section">
          <h2 class="restaurant__information__title">Type</h2>
          <p class="restaurant__information__data">${restaurant.type}</p>
        </div>
        <div class="restaurant__information__section">
          <h2 class="restaurant__information__title">Rating</h2>
          <p class="restaurant__information__data">${this.star.repeat(
            restaurant.rating
          )}</p>
        </div>
        <div class="restaurant__information__section">
          <h2 class="restaurant__information__title">Distance</h2>
          <p class="restaurant__information__data">2 Kilometers</p>
        </div>
      </div>
    </div>`;

    document
      .querySelector(".sidebar__restaurants__el__alpha")
      .insertAdjacentHTML("afterend", html);
  }

  _displayForm(mapE) {
    this.#mapEvent = mapE;
    formContainer.classList.remove("hidden");
  }

  _setLocalStorage() {
    localStorage.setItem("restaurants", JSON.stringify(this.#restaurantsArray));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("restaurants"));

    if (!data) return;

    this.#restaurantsArray = data;

    this.#restaurantsArray.forEach((restaurant) => {
      this._newRestaurantFile(restaurant);
    });
  }

  reset() {
    localStorage.removeItem("restaurants");
    location.reload();
  }
}

const app = new App();
