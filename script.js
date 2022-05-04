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
const sidebarSelectorType = document.querySelector(".sidebar__selector__type");
const compassIcon = document.querySelector(".compass-icon");
const informationIcon = document.querySelector(".information-icon");
const modalWrap = document.querySelector(".modal-wrap");
const modalCloseButton = document.querySelector(".modal__intro-button--close");
const modalLearnMoreButon = document.querySelector(
  ".modal__intro-button--learn"
);
const modalTutorialContainer = document.querySelector(
  ".modal__tutorial-container"
);
const allModalTutorialContainers = document.querySelectorAll(
  ".modal__tutorial-container"
);
const paginationButtonRight = document.querySelector(
  ".pagination-button__right"
);
const paginationButtonLeft = document.querySelector(".pagination-button__left");
const paginationButtonDone = document.querySelector(".pagination-button__done");
const formExit = document.querySelector(".form__exit");
const modalExit = document.querySelector(".modal__exit");
const modalContainer = document.querySelector(".modal-container");

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
  #rating;
  star = "<span>⭐</span>";
  #openPopup = false;
  #currentLocationLatitude;
  #currentLocationLongitude;
  #currentLocation;
  #selectedSorting;
  #selectedRating;
  #selectedDistance;
  #selectedType;
  #restaurantsArray = [];
  #markerArray = [];
  #filteredRestaurantsArray;
  #filteredMarkerArray;
  #tutorialSlideIndex = 0;
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
      this._displayFilteredRestaurants.bind(this)
    );
    sidebarSelectorRating.addEventListener(
      "change",
      this._displayFilteredRestaurants.bind(this)
    );

    sidebarSelectorDistance.addEventListener(
      "change",
      this._displayFilteredRestaurants.bind(this)
    );
    sidebarSelectorType.addEventListener(
      "change",
      this._displayFilteredRestaurants.bind(this)
    );
    compassIcon.addEventListener(
      "click",
      this._moveToCurrentPosition.bind(this)
    );
    informationIcon.addEventListener("click", this._openModal.bind(this));
    modalCloseButton.addEventListener("click", this._closeModal.bind(this));
    modalLearnMoreButon.addEventListener(
      "click",
      this._startTutorial.bind(this)
    );
    paginationButtonRight.addEventListener(
      "click",
      this._goToNextTutorialSlide.bind(this)
    );
    paginationButtonLeft.addEventListener(
      "click",
      this._goToPreviousTutorialSlide.bind(this)
    );
    paginationButtonDone.addEventListener(
      "click",
      this._resetTutorial.bind(this)
    );
    document.addEventListener("click", this._closeForm.bind(this));
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

  _displayForm(mapE) {
    this.#mapEvent = mapE;
    formContainer.classList.remove("hidden");
  }

  _newRestaurant(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const clickLocation = [lat, lng];

    const distance =
      Math.round(
        this.#mapEvent.latlng.distanceTo(this.#currentLocation) / 100
      ) / 10;

    const starArray = Array.from(starWidgets);

    starWidgets.forEach((el, i) => {
      if (el.checked) {
        console.log(starWidgets[i].getAttribute("id"));
        this.#rating = Number(starWidgets[i].getAttribute("id").slice(-1));
      }
    });

    // Build a new restaurant
    const restaurantName = formInputName.value
      .toLowerCase()
      .split(" ")
      .map((string) => string.charAt(0).toUpperCase() + string.substring(1))
      .join(" ");
    let restaurant = new Restaurant(
      restaurantName,
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
    marker.type = restaurant.type;
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

  _closeForm(e) {
    if (
      e.target.classList.contains("modal-container") ||
      e.target.classList.contains("modal__exit")
    ) {
      this._clearForm();
      modalContainer.classList.add("hidden");
    }
  }

  _updateTutorialSlide() {
    allModalTutorialContainers.forEach((el, i) => {
      if (this.#tutorialSlideIndex === i)
        allModalTutorialContainers[i].classList.remove("hidden");
      if (this.#tutorialSlideIndex !== i)
        allModalTutorialContainers[i].classList.add("hidden");
    });
  }

  _goToNextTutorialSlide() {
    this.#tutorialSlideIndex++;
    if (this.#tutorialSlideIndex === allModalTutorialContainers.length - 1) {
      paginationButtonRight.classList.add("hidden");
      paginationButtonDone.classList.remove("hidden");
    }
    this._updateTutorialSlide();
  }

  _goToPreviousTutorialSlide() {
    this.#tutorialSlideIndex--;
    if (this.#tutorialSlideIndex < 0) {
      this.#tutorialSlideIndex = 0;
    }
    if (this.#tutorialSlideIndex < allModalTutorialContainers.length - 1) {
      paginationButtonRight.classList.remove("hidden");
      paginationButtonDone.classList.add("hidden");
    }
    this._updateTutorialSlide();
  }

  _resetTutorial() {
    this.#tutorialSlideIndex = 0;
    document
      .querySelector(".modal__intro-container")
      .classList.remove("hidden");
    paginationButtonLeft.classList.add("hidden");
    paginationButtonDone.classList.add("hidden");
    allModalTutorialContainers.forEach((el) => el.classList.add("hidden"));
    this._closeModal();
  }

  _startTutorial() {
    document.querySelector(".modal__intro-container").classList.add("hidden");
    modalTutorialContainer.classList.remove("hidden");
    paginationButtonLeft.classList.remove("hidden");
    paginationButtonRight.classList.remove("hidden");
  }

  _closeModal() {
    modalWrap.classList.add("hidden");
  }

  _openModal() {
    modalWrap.classList.remove("hidden");
  }

  _displayFilteredRestaurants() {
    this.#filteredMarkerArray = this.#markerArray;
    this.#filteredRestaurantsArray = this.#restaurantsArray;
    const allRestaurants = document.querySelectorAll(".restaurant");
    this.#selectedDistance = Number(sidebarSelectorDistance.value);
    this.#selectedRating = Number(sidebarSelectorRating.value);
    this.#selectedSorting = sidebarSelectorSort.value;

    this.#selectedType = sidebarSelectorType.value;

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance !== 0 &&
      this.#selectedRating !== 0 &&
      this.#selectedType != 0
    ) {
      this.#filteredMarkerArray = this.#markerArray.filter(
        (el) =>
          el.distance <= this.#selectedDistance &&
          el.rating === this.#selectedRating &&
          el.type === this.#selectedType
      );

      this.#filteredRestaurantsArray = this.#restaurantsArray.filter(
        (el) =>
          el.distance <= this.#selectedDistance &&
          el.rating === this.#selectedRating &&
          el.type === this.#selectedType
      );
    }

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance !== 0 &&
      this.#selectedRating === 0 &&
      this.#selectedType == 0
    ) {
      this.#filteredMarkerArray = this.#markerArray.filter(
        (el) => el.distance <= this.#selectedDistance
      );
      this.#filteredRestaurantsArray = this.#restaurantsArray.filter(
        (el) => el.distance <= this.#selectedDistance
      );
    }

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance === 0 &&
      this.#selectedRating !== 0 &&
      this.#selectedType == 0
    ) {
      this.#filteredMarkerArray = this.#markerArray.filter(
        (el) => el.rating === this.#selectedRating
      );
      this.#filteredRestaurantsArray = this.#restaurantsArray.filter(
        (el) => el.rating === this.#selectedRating
      );
    }

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance === 0 &&
      this.#selectedRating === 0 &&
      this.#selectedType != 0
    ) {
      this.#filteredMarkerArray = this.#markerArray.filter(
        (el) => el.type === this.#selectedType
      );
      this.#filteredRestaurantsArray = this.#restaurantsArray.filter(
        (el) => el.type === this.#selectedType
      );
    }

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance !== 0 &&
      this.#selectedRating === 0 &&
      this.#selectedType != 0
    ) {
      this.#filteredMarkerArray = this.#markerArray.filter(
        (el) =>
          el.type === this.#selectedType &&
          el.distance <= this.#selectedDistance
      );
      this.#filteredRestaurantsArray = this.#restaurantsArray.filter(
        (el) =>
          el.type === this.#selectedType &&
          el.distance <= this.#selectedDistance
      );
    }

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance !== 0 &&
      this.#selectedRating !== 0 &&
      this.#selectedType == 0
    ) {
      this.#filteredMarkerArray = this.#markerArray.filter(
        (el) =>
          el.rating === this.#selectedRating &&
          el.distance <= this.#selectedDistance
      );
      this.#filteredRestaurantsArray = this.#restaurantsArray.filter(
        (el) =>
          el.rating === this.#selectedRating &&
          el.distance <= this.#selectedDistance
      );
    }

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance === 0 &&
      this.#selectedRating !== 0 &&
      this.#selectedType != 0
    ) {
      this.#filteredMarkerArray = this.#markerArray.filter(
        (el) =>
          el.rating === this.#selectedRating && el.type === this.#selectedType
      );
      this.#filteredRestaurantsArray = this.#restaurantsArray.filter(
        (el) =>
          el.rating === this.#selectedRating && el.type === this.#selectedType
      );
    }

    if (
      this.#selectedSorting !== 0 &&
      this.#selectedDistance === 0 &&
      this.#selectedRating === 0 &&
      this.#selectedType == 0
    ) {
      this.#filteredMarkerArray = this.#markerArray;
      this.#filteredRestaurantsArray = this.#restaurantsArray;
    }

    if (this.#selectedSorting == 0) this._sortHTML();
    if (this.#selectedSorting === "distance") this._sortByDistance();
    if (this.#selectedSorting === "rating") this._sortByRating();

    console.log(this.#markerArray);
    console.log(this.#filteredMarkerArray);
    this._displayFilteredMarkers();
  }

  _sortHTML() {
    sidebarRestaurantsContainer.innerHTML =
      "<div class=sidebar__restaurants__el__alpha></div>";
    this.#filteredRestaurantsArray.forEach((el, i) => {
      let html = `
      <div class="restaurant" data-id="${this.#filteredRestaurantsArray[i].id}">
        <div class="restaurant__header">
          <h1 class="restaurant__title">${
            this.#filteredRestaurantsArray[i].name
          }</h1>
          <div class="restaurant__icon-container">
            <ion-icon class="restaurant__icon restaurant__icon__nav" name="navigate-outline"></ion-icon>
            <ion-icon class="restaurant__icon restaurant__icon__trash" name="trash-outline"></ion-icon> 
          </div>
        </div>
        <div class="restaurant__information">
          <div class="restaurant__data-container>
            <p class="restaurant__data"><span class="star-emoji">${this.star.repeat(
              this.#filteredRestaurantsArray[i].rating
            )}</span></p>
            <p class="restaurant__data">${
              this.#filteredRestaurantsArray[i].type
            }</p>
            <p class="restaurant__data">${
              this.#filteredRestaurantsArray[i].distance
            } Km</p>
            <p class="restaurant__notes">${
              this.#filteredRestaurantsArray[i].notes
            }</p>
          </div>
        </div>
      </div>`;
      document
        .querySelector(".sidebar__restaurants__el__alpha")
        .insertAdjacentHTML("afterend", html);
    });
  }

  _displayFilteredMarkers() {
    this.#markerArray.forEach((el) => {
      el.remove();
    });
    this.#filteredMarkerArray.forEach((el) => {
      el.addTo(this.#map);
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
    this.#filteredRestaurantsArray.sort(compare.bind(this));
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
    this.#filteredRestaurantsArray.sort(compare.bind(this));
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
      const restaurantIndex = this.#restaurantsArray.indexOf(restaurant);
      const markerIndex = this.#markerArray.indexOf(restaurantMarker);
      console.log(this.#markerArray);
      this.#restaurantsArray.splice(restaurantIndex, 1);
      this.#markerArray.splice(markerIndex, 1);
      console.log(this.#markerArray);
      restaurantEl.remove();
      this.#map.removeLayer(restaurantMarker);
      this._setLocalStorage();
    }
  }

  _moveToMarker(e) {
    if (e.target.classList.contains("restaurant__icon__nav")) {
      this._toggleSidebar();
      const restaurantEl = e.target.closest(".restaurant");

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

  _moveToCurrentPosition() {
    this.#map.setView(this.#currentLocation, 13);
  }

  _newRestaurantFile(restaurant) {
    let html = `
    <div class="restaurant" data-id="${restaurant.id}" 
      data-rating="${restaurant.rating}"
      data-distance="${restaurant.distance}"
      data-type="${restaurant.type}"">
      <div class="restaurant__header">
        <h1 class="restaurant__title">${restaurant.name}</h1>
        <div class="restaurant__icon-container">
          <ion-icon class="restaurant__icon restaurant__icon__nav" name="navigate-outline"></ion-icon>
          <ion-icon class="restaurant__icon restaurant__icon__trash" name="trash-outline"></ion-icon> 
        </div>
      </div>
      <div class="restaurant__information">
        <div class="restaurant__data-container>
          <p class="restaurant__data"><span class="star-emoji">${this.star.repeat(
            restaurant.rating
          )}</span></p>
          <p class="restaurant__data">${restaurant.type}</p>
          <p class="restaurant__data">${restaurant.distance} Km</p>
          <p class="restaurant__notes">${restaurant.notes}</p>
        </div>
      </div>
    </div>`;

    document
      .querySelector(".sidebar__restaurants__el__alpha")
      .insertAdjacentHTML("afterend", html);
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
