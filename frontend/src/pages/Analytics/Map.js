import React, { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import HeatmapOverlay from "leaflet-heatmap";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  map: {
    width: "100%",
    height: "360px",
  },
}));

const cfg = {
  maxOpacity: 0.6,
  useLocalExtrema: true,
  scaleRadius: true,
  latField: "lat",
  lngField: "lon",
};

const HeatMap = ({ heatmapData }) => {
  const map = useMap();
  const [layer, setLayer] = useState(null);

  useEffect(() => {
    const layer = new HeatmapOverlay(cfg);
    setLayer(layer);
    map.addLayer(layer);
  }, []);

  useEffect(() => {
    if (layer) {
      layer.setData({ data: heatmapData });
    }
  }, [heatmapData, layer]);

  return null;
};

const Map = ({ data }) => {
  const classes = useStyles();

  let heatmapData = [];
  if (data !== null) {
    data.publishedPodcasts.edges.forEach((podcast) => {
      podcast.node.episodes.edges.forEach((episode) => {
        episode.node.views.edges.forEach((view) => {
          let point = JSON.parse(view.node.latLon);
          point.lat = Number(point.lat);
          point.lon = Number(point.lon);
          heatmapData.push(point);
        });
      });
    });
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      />
      <MapContainer
        center={[-33.7024, 151.0993]}
        zoom={2}
        className={classes.map}
      >
        <HeatMap heatmapData={heatmapData} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  );
};

export default Map;
