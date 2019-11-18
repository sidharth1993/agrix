import React, { Component } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import GeoJSON from 'ol/format/GeoJSON';
import OlSourceOSM from "ol/source/OSM";
import Zoom from 'ol/control/Zoom';
import { defaults } from 'ol/interaction'
import Draw from 'ol/interaction/Draw';
import { doubleClick } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { Fill, Stroke, Style, Text} from 'ol/style';
import windowDimensions from 'react-window-dimensions';
import PropType from 'prop-types';
import axios from 'axios';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import './styles/map.scss';
import MapControl from './MapControls';
import 'ol/ol.css';
import { message } from 'antd';
import './Map.css';

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
class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1,
      showSubmit: false,
      level: -1
    };
    this.draw = null;
  }
  configureMap = () => {
    let boundarySource = new VectorSource();
    let boundaryLayer = new VectorLayer({
      source: boundarySource,
      style: f => styleBorder(f)
    });
    let level1Source = new VectorSource();
    let level1Layer = new VectorLayer({
      source: level1Source,
      style: f => styleDt(f)
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
        drawVector,
        level1Layer
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
/*   shouldComponentUpdate(nextProps) {
    if(this.props.logged !== nextProps.logged)
      return true;
    return false;
  } */
  select = new Select({
    condition: doubleClick
  })
  fitToExtent = feature => {
    let extent = feature.getGeometry().getExtent();
    this.olmap.getView().fit(extent, { duration: 2000 });
  }
  selectArea = (source, id) => {
    const { level } = this.state;
    let url = `https://agrix-api.herokuapp.com/server/api/division?level=${this.state.level}`;
    if (level === 1)
      url += `&blockId=${id}`;
    if (level === 0 || (level === 1 && id)) {
      let hide = message.loading('Loading Map', 0);
      axios.get(url).then(res => {
        if (!res.data.status)
          return;
        let boundarySource = new VectorSource({
          features: (new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })).readFeatures(res.data.data)
        });
        let layer;
        if (level === 0) {
          layer = this.olmap.getLayers().array_[1]
          this.setState({ level: 1 });
        } else if (level === 1) {
          layer = this.olmap.getLayers().array_[3];
        }
        layer.setSource(boundarySource);
        setTimeout(() => {
          if (level === 1) {
            this.fitToExtent(source.getFeatures().getArray()[0])
          }
        }, 500);
        hide();
      }, res => { if (level === 0) hide(); });
    }
  }
  componentDidUpdate() {
    if (this.props.logged && this.state.level === -1) {
      let hide = message.loading('Loading Map', 0);
      axios.get(`https://agrix-api.herokuapp.com/server/api/location/geojson`).then(res => {
        if (!res.data.status) {
          return;
        }
        this.setState({ level: 0 });
        let boundarySource = new VectorSource({
          features: (new GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })).readFeatures(res.data.data)
        });
        this.olmap.getLayers().array_[1].setSource(boundarySource);
        setTimeout(() => {
          this.fitToExtent(this.olmap.getLayers().array_[1].getSource().getFeatures()[0])
          hide();
          message.info('Hint: Double click to load districts!')
        }, 1000);
        this.olmap.addInteraction(this.select);
        this.select.on('select', e => {
          try {
            const id = e.selected[0].getProperties('values_').OBJECTID;
            this.selectArea(e.target, id);
            if (e.selected[0].values_.BLOCKS_)
              this.fitToExtent(e.target.getFeatures().getArray()[0]);
          } catch (e) {
            console.log(e);
          }
        });
      });
    } else {
      this.clearLayers();
      this.olmap.removeInteraction(this.select);
      this.select.removeEventListener('select');
    }
  }
  clearLayers = () => {
    let layers = this.olmap.getLayers().array_;
    layers.forEach(layer => {
      layer.getSource().clear();
    });
  }
  toggleEdit = (edit) => {
    if (edit) {
      this.olmap.getLayers().array_[2].getSource().clear();
      this.draw = new Draw({
        source: this.drawSource,
        type: 'Polygon'
      });
      this.draw.on('drawend', () => {
        this.setState({
          showSubmit: true
        });
      });
      this.olmap.addInteraction(this.draw);
    } else {
      this.olmap && this.draw && this.olmap.removeInteraction(this.draw);
      this.draw && this.draw.removeEventListener('drawend');
      this.draw = null;
    }
  }
  clearDraw = () => {
    this.olmap && this.draw && this.olmap.removeInteraction(this.draw);
    this.draw && this.draw.removeEventListener('drawend');
    this.draw = null;
    this.olmap.getLayers().array_[2].getSource().clear();
  }
  handleSubmit = (showSubmit) => {
    this.setState({ showSubmit });
  }
  render() {
    this.updateMap();
    return (
      <>
        <div id="draw-map" style={{ width: "100%", height: `${this.props.height - 67}px` }}></div>
        {this.props.logged && <MapControl
          editAction={this.toggleEdit}
          clearDraw={this.clearDraw}
          handleSubmit={this.handleSubmit}
          submit={this.state.showSubmit}/>}
      </>
    )
  }
}
Map.propTypes = {
  height: PropType.number
}
export default windowDimensions()(Map);
