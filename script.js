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
const sidebarSelectorSort = document.querySelector(".sidebar__selector__sort");
const sidebarSelectorRating = document.querySelector(
  ".sidebar__selector__rating"
);
const sidebarSelectorDistance = document.querySelector(
  ".sidebar__selector__distance"
);

class Restaurant {
  id = (Date.now() + "").slice(-10);
  clicks = 0;
  star = "<span>⭐</span>";
  constructor(name, type, rating, notes, coords, distance) {
    this.name = name;
    this.type = type;
    this.rating = rating;
    this.notes = notes;
    this.coords = coords;
    this.distance = distance;
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
  #openPopup = false;
  sortedBestToWorst = false;
  sortedClosestToFarthest = false;
  #currentLocationLatitude;
  #currentLocationLongitude;
  #currentLocation;
  #selectedRating;
  #selectedDistance;
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
    sidebarSelectorSort.addEventListener(
      "change",
      this._sortRestaurants.bind(this)
    );
    sidebarSelectorRating.addEventListener(
      "change",
      this._displayFilteredRestaurants.bind(this)
    );

    sidebarSelectorDistance.addEventListener(
      "change",
      this._displayFilteredRestaurants.bind(this)
    );
  }

  _displayFilteredRestaurants() {
    const allRestaurants = document.querySelectorAll(".restaurant");
    this.#selectedDistance = Number(sidebarSelectorDistance.value);
    this.#selectedRating = Number(sidebarSelectorRating.value);
    console.log(sidebarSelectorDistance.dataset.id);

    // this.#markerArray.forEach((el) => {
    //   el.remove();
    //   if (
    //     el.distance <= this.#selectedDistance &&
    //     el.rating === this.#selectedRating
    //   ) {
    //     el.addTo(this.#map);
    //   }
    // });

    if (this.#selectedDistance === 0) {
      this.#markerArray.forEach((el) => {
        el.remove();
        if (el.rating === this.#selectedRating) {
          el.addTo(this.#map);
        }
      });
      allRestaurants.forEach((el, i) => {
        if (Number(allRestaurants[i].dataset.rating) === this.#selectedRating) {
          allRestaurants[i].style.display = "block";
        }
        if (Number(allRestaurants[i].dataset.rating) !== this.#selectedRating) {
          allRestaurants[i].style.display = "none";
        }
      });
    }

    if (this.#selectedRating === 0) {
      this.#markerArray.forEach((el) => {
        el.remove();
        if (el.distance <= this.#selectedDistance) {
          el.addTo(this.#map);
        }
      });
      allRestaurants.forEach((el, i) => {
        if (
          Number(allRestaurants[i].dataset.distance) <= this.#selectedDistance
        ) {
          allRestaurants[i].style.display = "block";
        }
        if (
          Number(allRestaurants[i].dataset.distance) >= this.#selectedDistance
        ) {
          allRestaurants[i].style.display = "none";
        }
      });
    }

    if (this.#selectedDistance !== 0 && this.#selectedRating !== 0) {
      this.#markerArray.forEach((el) => {
        el.remove();
        if (
          el.distance <= this.#selectedDistance &&
          el.rating === this.#selectedRating
        ) {
          el.addTo(this.#map);
        }
      });
      allRestaurants.forEach((el, i) => {
        if (
          Number(allRestaurants[i].dataset.distance) <= this.#selectedDistance
        ) {
          allRestaurants[i].style.display = "block";
        }
        if (Number(allRestaurants[i].dataset.rating) === this.#selectedRating) {
          allRestaurants[i].style.display = "block";
        }
        if (
          Number(allRestaurants[i].dataset.distance) >= this.#selectedDistance
        ) {
          allRestaurants[i].style.display = "none";
        }
        if (Number(allRestaurants[i].dataset.rating) !== this.#selectedRating) {
          allRestaurants[i].style.display = "none";
        }
      });
    }

    if (this.#selectedDistance === 0 && this.#selectedRating === 0) {
      this.#markerArray.forEach((el) => {
        el.remove();
        el.addTo(this.#map);
      });
      allRestaurants.forEach((el) => {
        el.style.display = "block";
      });
    }
  }

  _sortRestaurants() {
    const selected =
      sidebarSelectorSort.options[sidebarSelectorSort.selectedIndex].text;
    if (selected === "Rating") {
      this._sortByRating();
    }
    if (selected === "Distance") {
      this._sortByDistance();
    }
  }

  _sortHTML() {
    sidebarRestaurantsContainer.innerHTML =
      "<div class=sidebar__restaurants__el__alpha></div>";
    this.#restaurantsArray.forEach((el, i) => {
      let html = `
      <div class="restaurant" data-id="${this.#restaurantsArray[i].id}">
        <div class="restaurant__header">
          <h1 class="restaurant__title">${this.#restaurantsArray[i].name}</h1>
          <div class="restaurant__icon-container">
            <ion-icon class="restaurant__icon restaurant__icon__nav" name="navigate-outline"></ion-icon>
            <ion-icon class="restaurant__icon restaurant__icon__trash" name="trash-outline"></ion-icon> 
          </div>
        </div>
        <div class="restaurant__information">
          <div class="restaurant__information__section">
            <h2 class="restaurant__information__title">Type</h2>
            <p class="restaurant__information__data">${
              this.#restaurantsArray[i].type
            }</p>
          </div>
          <div class="restaurant__information__section">
            <h2 class="restaurant__information__title">Rating</h2>
            <p class="restaurant__information__data">${this.star.repeat(
              this.#restaurantsArray[i].rating
            )}</p>
          </div>
          <div class="restaurant__information__section">
            <h2 class="restaurant__information__title">Distance</h2>
            <p class="restaurant__information__data">${
              this.#restaurantsArray[i].distance
            } Kilometers</p>
          </div>
        </div>
      </div>`;
      document
        .querySelector(".sidebar__restaurants__el__alpha")
        .insertAdjacentHTML("afterend", html);
    });
  }

  _sortByDistance() {
    function compare(a, b) {
      if (a.distance < b.distance) {
        return 1;
      }
      if (a.distance > b.distance) {
        return -1;
      }
    }
    this.#restaurantsArray.sort(compare.bind(this));
    this._sortHTML();
  }

  _sortByRating() {
    function compare(a, b) {
      if (a.rating < b.rating) {
        return -1;
      }
      if (a.rating > b.rating) {
        return 1;
      }
    }
    this.#restaurantsArray.sort(compare.bind(this));
    this._sortHTML();
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

      this.#markerArray.forEach((el) => {
        el.closePopup();
      });

      const marker = this.#markerArray.find(
        (el) => el.id === restaurantEl.dataset.id
      );

      marker.openPopup();

      this.#map.setView(restaurant.coords, 15, {
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
    this.#currentLocationLatitude = position.coords.latitude;
    this.#currentLocationLongitude = position.coords.longitude;
    this.#currentLocation = [
      this.#currentLocationLatitude,
      this.#currentLocationLongitude,
    ];

    this.#map = L.map("map").setView(this.#currentLocation, 13);

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

    const distance =
      Math.round(
        this.#mapEvent.latlng.distanceTo(this.#currentLocation) / 100
      ) / 10;

    console.log(distance);

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
      [lat, lng],
      distance
    );

    this.#restaurantsArray.push(restaurant);

    this._newRestaurantFile(restaurant);

    this.#openPopup = true;

    this._renderRestaurantMarker(restaurant);

    this._clearForm();

    this._setLocalStorage();
  }

  _renderRestaurantMarker(restaurant) {
    const marker = new L.Marker(restaurant.coords);
    marker.rating = restaurant.rating;
    marker.distance = restaurant.distance;
    this.#map.addLayer(marker);
    marker
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 50,
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
      );
    if (this.#openPopup) marker.openPopup();
    marker.id = restaurant.id;
    this.#markerArray.push(marker);
  }

  _newRestaurantFile(restaurant) {
    let html = `
    <div class="restaurant" data-id="${restaurant.id}" 
      data-rating="${restaurant.rating}"
      data-distance="${restaurant.distance}"">
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
          <p class="restaurant__information__data">${
            restaurant.distance
          } Kilometers</p>
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
