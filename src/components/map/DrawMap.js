import React, { useState, useEffect, useRef } from "react";
import { Fill, Stroke, Style, Text} from 'ol/style';
import windowDimensions from 'react-window-dimensions';
import axios from 'axios';
import './styles/map.scss';
import MapControl from './MapControls';
import 'ol/ol.css';
import { message } from 'antd';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

const center = [0, 0];
const { REACT_APP_DOMAIN: domain, REACT_APP_LOGIN_PORT: port } = process.env;

const styleBorder = feature => new Style({
  stroke: new Stroke({
    color: '#0099FF',
    width: 1
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 0, 0)'
  })
});

const styleDt = feature => new Style({
  stroke: new Stroke({
    color: '#A03582',
    width: 2
  }),
  fill: new Fill({
    color: 'rgba(255, 255, 0, 0.1)'
  }),
  text: new Text({
    text: feature.values_.BLKNAME,
    fill: new Fill({
      color: '#f56a00'
    })
  })
});
let olmap = null;
const defaultZoom = 1;
const defaultShowSubmit = false;
const defaultPosition = [0,0];

let level = -1;
let map = null;
let featureGeoJson = null;
const DrawMap = ({height,width,logged}) => {

  const [zoom, setZoom] = useState(defaultZoom);
  const [showSubmit, setShowSubmit] = useState(defaultShowSubmit);
  const [geo,setGeo] = useState();
  const [position,setPosition] = useState(defaultPosition);
  
  const geoRef = useRef();
  const mapRef = useRef();
  //updateMap

  useEffect(()=>{
    map = L.map('map').setView([0,0], 2);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light'
    }).addTo(map);
  },[]);

  const onEachFeature = (feature, layer)=>{
    if (feature.properties && feature.properties.District) {
        layer.on('dblclick',(event)=>{
          selectArea(event.target.feature.properties.OBJECTID);
        });
    }
}

  const selectArea = (id) => {
    let url = `https://agrix-api.herokuapp.com/server/api/division?level=${level}`;
    if (level === 1)
      url += `&blockId=${id}`;
    if (level === 0 || (level === 1 && id)) {
      let hide = message.loading('Loading Map', 0);
      axios.get(url).then(res => {
        if(!res.data.status)
          return;
          if(level === 1){
            if(featureGeoJson){
              map.removeLayer(featureGeoJson);
            } 
            featureGeoJson = L.geoJSON(res.data.data).addTo(map);
            map.fitBounds(featureGeoJson.getBounds());
          }
        if(level === 0) {
          let geoJson = L.geoJSON(res.data.data,{
            onEachFeature: onEachFeature
          }).addTo(map);
          map.fitBounds(geoJson.getBounds());
            level = 1;
          }
        hide();
      }, res => { if (level === 0) hide(); });
    }
  }

  useEffect(()=>{
    setTimeout(effectComponentDidUpdate,100);
  },[logged]);

  const effectComponentDidUpdate = ()=>{
    if (logged) {
      let hide = message.loading('Loading Map', 0);
      axios.get(`https://agrix-api.herokuapp.com/server/api/location/geojson`).then(res => {
        if (!res.data.status) {
          return;
        }
        level = 0;
        const geoJson = L.geoJSON(res.data.data, {
          style: function (feature) {
              return {color: feature.properties.color};
          }
          }).addTo(map);
          map.fitBounds(geoJson.getBounds());
        setTimeout(() => {
          hide();
          map.on('dblclick',(event)=>{
            if(level === 0)
            selectArea(0);
          });
          message.info('Hint: Double click to load districts!')
        }, 1000);
      });
    } 
  }
    

  return (
    <>
    <div id='map'></div>
    </>
  )
}

export default windowDimensions()(DrawMap);