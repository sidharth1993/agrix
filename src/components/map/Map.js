/* eslint-disable */
import React, { Component } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import GeoJSON from 'ol/format/GeoJSON';
import OlSourceOSM from "ol/source/OSM";
import Zoom from 'ol/control/Zoom';
import windowDimensions from 'react-window-dimensions';
import Draw from 'ol/interaction/Draw';
import PropType from 'prop-types';
import { Fill, Stroke, Style } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Proj4 from 'proj4/lib';
import { register } from 'ol/proj/proj4';
import isEqual from 'lodash/isEqual';
import geo from './static/clipped_poly.js';
import { filterGeo, filterLulc, getNetherlands } from './utils/filter';
import './styles/map.scss';
import MapControl from './MapControls';
import { Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj';

const colors = {
  1: 'purple',
  2: 'red',
  3: 'pink',
  4: 'indigo',
  5: 'blue',
  6: 'green',
  7: 'lime',
  8: 'orange',
  9: 'brown',
  10: 'gray',
  11: 'deeporange',
  'forest': 'green',
  'other' : 'deeporange',
  'agri' : 'purple',
  'Water': 'blue'
};


const styles = (id, mainType) => id ? new Style({
  stroke: new Stroke({
    color: colors[id],
    width: 1
  }),
  fill: new Fill({
    color: colors[id]
  })
}) : new Style({
  stroke: new Stroke({
    color: 'blue',
    width: 1
  }),
  fill: new Fill({
    color: 'rgba(255, 255, 0, 0.1)'
  })
})

const geoJsonObject = geo;
const tamilNadu = fromLonLat([6, 52.5]);
class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      center: [8709513.394721, 1180899.307219],
      zoom: 1,
      initialView: false,
      showSubmit: false,
      crops: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true }
    };
    this.draw = null;
    this.updateLegends = this.updateLegends.bind(this);
    Proj4.defs("EPSG:28992", "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
    register(Proj4);
    let vectorSource = new VectorSource();
    let lulcSource = new VectorSource();
    let boundarySource = new VectorSource();
    let vectorLayer = new VectorLayer({
      source: vectorSource,
      style: f => this.styleFunction(f,1)
    });
    let lulcLayer = new VectorLayer({
      source: lulcSource,
      style: f => this.styleFunction(f,3)
    });
    let boundaryLayer = new VectorLayer({
      source: boundarySource,
      style: f => this.styleFunction(f,3)
    });
    this.drawSource = new VectorSource({ wrapX: false });
    var drawVector = new VectorLayer({
      source: this.drawSource
    });
    this.view = new OlView({
      center: [8709513.394721, 1180899.307219],
      zoom: this.state.zoom
    })
    this.olmap = new OlMap({
      target: null,
      layers: [
        new OlLayerTile({
          source: new OlSourceOSM()
        }),
        vectorLayer,
        lulcLayer,
        boundaryLayer,
        drawVector
      ],
      controls: [
        new Zoom({
          className: 'zoom'
        })
      ],
      view: this.view
    });
  }

  styleFunction = (feature, mainType) => {
    let id = mainType === 3 ? feature.values_.Hoofdgroep : feature.values_.GWS_GEWASC;
    if(mainType === 3) console.log(id);
    return styles(id, mainType);
  };
  updateLegends = crops => {
    if(this.props.logged && location.hash === '#/results'){
      let filtered = filterGeo(crops, this.props.mainType);
      let lulc = filterLulc();
      let vectorSource = new VectorSource({
        features: (new GeoJSON({
          dataProjection: 'EPSG:28992',
          featureProjection: 'EPSG:3857'
        })).readFeatures(filtered)
      });
      let lulcSource = new VectorSource({
        features: (new GeoJSON({
          dataProjection: 'EPSG:28992',
          featureProjection: 'EPSG:3857'
        })).readFeatures(lulc)
      });
      this.olmap.getLayers().array_[1].setSource(vectorSource);
      this.olmap.getLayers().array_[2].setSource(lulcSource);
    }else if(this.props.logged && location.hash === '#/'){
      let dutch = getNetherlands();
      let vectorSource = new VectorSource({
        features: (new GeoJSON({})).readFeatures(dutch)
      });
      this.olmap.getLayers().array_[3].setSource(vectorSource);
    }
  };

  updateMap() {
    //this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
  }

  componentDidMount() {
    this.olmap.setTarget("map");
    this.olmap.on("moveend", () => {
      let zoom = this.olmap.getView().getZoom();
      this.setState({ zoom });
    });

  }
  shouldComponentUpdate(nextProps, nextState) {
    let zoom = this.olmap.getView().getZoom();
    if (zoom === nextState.zoom && this.props.mainType === nextProps.mainType && this.props.logged === nextProps.logged && isEqual(this.props.subType, nextProps.mainType)) return false;
    return true;
  }
  componentDidUpdate() {
    let me = this;
    let crop = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false, 10: false, 11: false };
    let { mainType, subType, logged } = this.props;
    if (mainType === 1) {
      if (subType[101])
        crop[1] = true;
      if (subType[102])
        crop = { ...crop, ...{ 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true } };
    }
    if (mainType === 2) {
      if (subType[201])
        crop = { ...crop, ...{ 1: true, 2: true, 3: true } };
      if (subType[202])
        crop = { ...crop, ...{ 6: true, 7: true, 4: true, 5: true } };
      if (subType[203])
        crop = { ...crop, ...{ 8: true, 9: true, 10: true, 11: true } };
    }
    if (mainType === 3) {
      crop = { urban: false, agri: false, other: false, forest: false, Water: false }
      if (subType[301])
        crop.urban = true;
      if (subType[302])
        crop.agri = true;
      if (subType[303])
        crop.Water = true;
      if (subType[304])
        crop.forest = true;
      if (subType[305])
        crop.other = true;
    }
    this.updateLegends(crop);
  }
  toggleEdit = (edit) => {
    if (edit) {
      this.draw = new Draw({
        source: this.drawSource,
        type: 'Polygon'
      });
      this.draw.on('drawend', event => {
        this.setState(prevState => {
          prevState.showSubmit = true;
          return prevState
        });
      });
      this.olmap.addInteraction(this.draw);
    } else {
      this.olmap.removeInteraction(this.draw);
      this.draw.removeEventListener('drawend');
      this.draw = null;
    }
  }
  render() {
    this.props.sendView(this.view);
    this.updateMap();
    return (
      <>
        <div key='map' id="map" style={{ width: "100%", height: `${this.props.height - 67}px` }} key='0'></div>
        {this.props.logged && <MapControl key='ctrl' editAction={this.toggleEdit} submit={this.state.showSubmit} />}
      </>
    )
  }
}
Map.propTypes = {
  height: PropType.number
}
export default windowDimensions()(Map);
