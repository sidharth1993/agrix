import React, { Component } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import GeoJSON from 'ol/format/GeoJSON';
import OlSourceOSM from "ol/source/OSM";
import Zoom from 'ol/control/Zoom';
import {defaults} from 'ol/interaction'
import windowDimensions from 'react-window-dimensions';
import Draw from 'ol/interaction/Draw';
import {doubleClick} from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import PropType from 'prop-types';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import isEqual from 'lodash/isEqual';
import { getTamilNadu } from './utils/filter';
import './styles/map.scss';
import MapControl from './MapControls';
import 'ol/ol.css';

const center = [0, 0];
class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1,
      showSubmit: false,
    };
    this.draw = null;
  }
  configureMap = () => {
    let boundarySource = new VectorSource();
    let boundaryLayer = new VectorLayer({
      source: boundarySource
    });
    this.drawSource = new VectorSource({ wrapX: false });
    var drawVector = new VectorLayer({
      source: this.drawSource
    });
    this.view = new OlView({
      center,
      zoom: this.state.zoom
    })
    var raster = new OlLayerTile({
      source: new OlSourceOSM()
    });
    this.olmap = new OlMap({
      interactions: defaults({
        doubleClickZoom: false
      }),
      target: null,
      layers: [
        raster,
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

  updateMap() {
    if (this.olmap)
      this.olmap.getView().setZoom(this.state.zoom);
  }

  componentDidMount() {
    this.configureMap();
    this.olmap.setTarget("draw-map");
    this.olmap.on("moveend", () => {
      let zoom = this.olmap.getView().getZoom();
      this.setState({ zoom });
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    let zoom = this.olmap.getView().getZoom();
    if (zoom === nextState.zoom &&
      this.props.mainType === nextProps.mainType &&
      this.props.logged === nextProps.logged &&
      isEqual(this.props.subType, nextProps.mainType))
      return false;
    return true;
  }
  select = new Select({
    condition: doubleClick
  })
  componentDidUpdate() {
    if (this.props.logged) {
      let tamizh = getTamilNadu();
      let boundarySource = new VectorSource({
        features: (new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })).readFeatures(tamizh)
      });
      this.olmap.getLayers().array_[1].setSource(boundarySource);
      this.olmap.addInteraction(this.select);
      this.select.on('select', e => {
        
        var extent = e.target.getFeatures().getArray()[0].getGeometry().getExtent();
        this.olmap.getView().fit(extent,{duration:2000});//use easing for animation
      });
    } else {
      this.clearLayers();
      this.olmap.removeInteraction(this.select);
      this.select.removeEventListener('select');
    }
  }
  clearLayers = () =>{
    let layers = this.olmap.getLayers().array_;
    layers.forEach(layer => {
      layer.getSource().clear();
    });
  }
  toggleEdit = (edit) => {
    if (edit) {
      this.draw = new Draw({
        source: this.drawSource,
        type: 'Polygon'
      });
      this.draw.on('drawend', () => {
        this.setState(prevState => {
          prevState.showSubmit = true;
          return prevState
        });
      });
      this.olmap.addInteraction(this.draw);
    } else {
      this.olmap && this.draw && this.olmap.removeInteraction(this.draw);
      this.draw && this.draw.removeEventListener('drawend');
      this.draw = null;
    }
  }
  render() {
    this.props.sendView(this.view);
    this.updateMap();
    return (
      <>
        <div id="draw-map" style={{ width: "100%", height: `${this.props.height - 67}px` }}></div>
        {this.props.logged && <MapControl key='ctrl' editAction={this.toggleEdit} submit={this.state.showSubmit} />}
      </>
    )
  }
}
Map.propTypes = {
  height: PropType.number
}
export default windowDimensions()(Map);
