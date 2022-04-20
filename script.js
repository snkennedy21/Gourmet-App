"use strict";

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const coords = [latitude, longitude];
      const map = L.map("map").setView(coords, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(coords)
        .addTo(map)
        .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
        .openPopup();
    },
    function () {
      alert("could not get position");
    }
  );
