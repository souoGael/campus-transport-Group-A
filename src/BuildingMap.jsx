import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZ3JvdXAtYSIsImEiOiJjbTBmYzY0OWYwOG42MnFzNDZocHY4dnh2In0.WI3g6Wlw3JlQ_RnbmqcDzg";
// mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_PUBLIC_TOKEN;
var MapLatitude = 26 + 11 / 60 + 20 / 3600;
MapLatitude *= -1; // South
var MapLongitude = 28 + 1 / 60 + 39 / 3600;

var MapDestLatitude = 26 + 11 / 60 + 40 / 3600;
MapDestLatitude *= -1; // South
var MapDestLongitude = 28 + 1 / 60 + 20 / 3600;

const Buildings = [
  {
    name: "TW Kambule. Mathematical Science Building",
    latitude: -26.19,
    longitude: 28.0263888,
  },
];

function PlaceClick(map, directions, e) {
  const coordinates = e.features[0].geometry.coordinates.slice();
  const title = e.features[0].properties.title;

  // You can also center the map on the clicked text, if desired
  map.flyTo({ center: coordinates });
  directions.setOrigin([MapLongitude, MapLatitude]); // Origin coordinates
  directions.setDestination([MapDestLongitude, MapDestLatitude]); // Destination coordinates

  const popupContent = `
    <h3>${title}</h3>
    <p>Building Information:</p>
    <p>This is the Mathematical Sciences Building. It hosts various research and academic departments.</p>
  `;

  // Create the popup and set its content
  new mapboxgl.Popup()
    .setLngLat(coordinates) // Position at the clicked coordinates
    .setHTML(popupContent) // Set the custom HTML content
    .addTo(map);
}

const BuildingMap = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [MapLongitude, MapLatitude], // Example starting position [lng, lat]
      zoom: 15,
    });

    // const marker = new mapboxgl.Marker({ color: "black" })
    //   .setLngLat([MapLongitude, MapLatitude])
    //   .addTo(map);

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.0275496235991, -26.191719275369223],
                  [28.02747007853489, -26.191539827653727],
                  [28.02743523365001, -26.19127569614509],
                  [28.027381042422178, -26.190896506988956],
                ],
                type: "LineString",
              },
            },
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.02654364409605, -26.191108133066066],
                  [28.02640328890581, -26.190556208790973],
                  [28.026275460481656, -26.18991551651743],
                  [28.02607141043393, -26.189906502184492],
                  [28.026039349645885, -26.189595221799458],
                  [28.027132326991165, -26.189470322200677],
                ],
                type: "LineString",
              },
            },
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.027050567549793, -26.188956510851526],
                  [28.025878989901543, -26.18906331259837],
                  [28.02487708444201, -26.18923853758075],
                  [28.024924705040036, -26.189578312148782],
                ],
                type: "LineString",
              },
            },
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.02575511000802, -26.18814538906875],
                  [28.025864962648086, -26.188782278908292],
                  [28.025901469672334, -26.189056231696256],
                  [28.025925572247985, -26.189615921816973],
                  [28.026037923743303, -26.189595926953743],
                ],
                type: "LineString",
              },
            },
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.024872388441793, -26.18923142609126],
                  [28.024735892340573, -26.188384860028393],
                ],
                type: "LineString",
              },
            },
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.026392718765493, -26.190543241294442],
                  [28.02559430985133, -26.190618836962116],
                ],
                type: "LineString",
              },
            },
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.030632027115104, -26.19148783987091],
                  [28.03046459897726, -26.18999271818867],
                  [28.0304206507208, -26.189592709270705],
                  [28.030298528339472, -26.189330734251655],
                ],
                type: "LineString",
              },
            },
            {
              type: "Feature",
              properties: {},
              geometry: {
                coordinates: [
                  [28.030553708489464, -26.190790430970544],
                  [28.02980387206955, -26.19086205838824],
                  [28.029464584336324, -26.190876518322327],
                  [28.029000522632856, -26.19100326027082],
                ],
                type: "LineString",
              },
            },
          ],
        },
      });

      //Add a layer to display the path (line)
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#2c3035", // Line color
          "line-width": 3, // Line width
        },
      });
    });

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric", // or 'imperial'
      profile: "mapbox/walking", // or 'mapbox/driving, 'mapbox/cycling'
    });

    // Add the Directions control to the map
    map.addControl(directions, "top-left");

    // Optionally set initial route
    directions.setOrigin([MapLongitude, MapLatitude]); // Origin coordinates
    directions.setDestination([MapDestLongitude, MapDestLatitude]); // Destination coordinates

    const topLeftControls = document.querySelector(".mapboxgl-ctrl-top-left");
    topLeftControls.style.top = "100px";
    topLeftControls.style.left = "30px";
    topLeftControls.id = "directions";

    // Add the GeoJSON source for the text points
    map.on("load", () => {
      // Prepare an array of features from the points array
      const features = Buildings.map((building) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [building.longitude, building.latitude],
        },
        properties: {
          title: building.name,
        },
      }));

      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features, // Add generated features to the GeoJSON
        },
      });

      // Add a layer to display the text
      map.addLayer({
        id: "text-layer",
        type: "symbol",
        source: "points",
        layout: {
          "text-field": ["get", "title"], // Display the 'title' property as text
          "text-size": 16,
          "text-offset": [0, 0.6], // Offset text above the point
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#fff", // Text color
        },
      });

      map.on("click", "text-layer", (e) => {
        PlaceClick(map, directions, e);
      });

      // Change the cursor to a pointer when hovering over the text
      map.on("mouseenter", "text-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      // Reset the cursor when it leaves the text
      map.on("mouseleave", "text-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
  );
};

export default BuildingMap;
