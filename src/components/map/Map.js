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
import { Fill, Stroke, Style, Text } from 'ol/style';
import windowDimensions from 'react-window-dimensions';
import PropType from 'prop-types';
import axios from 'axios';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import './styles/map.scss';
import MapControl from './MapControls';
import 'ol/ol.css';
import './Map.css';
import { message, Checkbox, Card, Typography } from 'antd';
import { filterGeo } from './utils/filter';
const { Text: TypographyText } = Typography;
const CheckboxGroup = Checkbox.Group;

const center = [0, 0];
const { REACT_APP_DOMAIN: domain, REACT_APP_LOGIN_PORT: port } = process.env;

const generateStyle = (strokeClr, fillClr, text, txtFillClr) => new Style({
  stroke: new Stroke({
    color: strokeClr,
    width: 1
  }),
  fill: new Fill({
    color: fillClr
  }),
  text: new Text({
    text: text,
    fill: new Fill({
      color: txtFillClr
    })
  })
});
const styleBorder = feature => {
  const { yield: y } = feature.values_;
  switch (y) {
    case 'High':
      return generateStyle('#A03582', '#87d068', feature.values_.BLKNAME, '#000');
    case 'Medium':
      return generateStyle('#A03582', '#FADA5E', feature.values_.BLKNAME, '#000');
    case 'Low':
      return generateStyle('#A03582', '#ff6347', feature.values_.BLKNAME, '#000');
    case 'Nil':
      return generateStyle('#A03582', '#D3D3D3', feature.values_.BLKNAME, '#000');
    default:
      return generateStyle('#A03582', 'rgba(255, 255, 0, 0.1)', feature.values_.BLKNAME, '#f56a00');
  }

}
const plainOptions = ['High', 'Medium', 'Low', 'Nil'];

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1,
      showSubmit: false,
      level: -1,
      checkedList: ['High', 'Medium', 'Low', 'Nil']
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
      style: f => styleBorder(f)
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
    if (this.props.logged) {
      let hide = message.loading('Loading Analysis for Pudhukottai : 621821', 0);
      let boundarySource = new VectorSource({
        features: (new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })).readFeatures(filterGeo())
      });
      this.olmap.getLayers().array_[1].setSource(boundarySource);
      this.olmap.addInteraction(this.select);
      setTimeout(() => {
        this.olmap.getView().fit([8732783.276223768, 1101579.0139838243, 8823962.420483025, 1201976.8502093428], { duration: 2000 });
        hide();
      }, 1000);
      this.select.on('select', e => {
        try {
          if (e.selected[0].values_.BLOCKS_)
            this.fitToExtent(e.target.getFeatures().getArray()[0]);
        } catch (e) {
          console.log(e);
        }
      });
    } else {
      this.clearLayers();
      this.olmap.removeInteraction(this.select);
      this.select.removeEventListener('select');
    }
  }
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
  onChange = checkedList => {
    this.setState({ checkedList });
    this.update(checkedList)
  }
  update = checkedList => { 
    let boundarySource = new VectorSource({
      features: (new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })).readFeatures(filterGeo(checkedList))
    });
    this.olmap.getLayers().array_[1].setSource(boundarySource);
    this.olmap.addInteraction(this.select);
  }
  render() {
    this.updateMap();
    return (
      <>
        <Card style={{ position: 'absolute', zIndex: 1, top: 70, right: 20 }}>
          <TypographyText strong>yield</TypographyText>
          <CheckboxGroup
          className='filter-checkbox'
            style={{ float: 'right', paddingLeft: '30px' }}
            options={plainOptions}
            value={this.state.checkedList}
            onChange={this.onChange}
          />
        </Card>
        <div id="draw-map" style={{ width: "100%", height: `${this.props.height - 67}px` }}></div>
        {this.props.logged && <MapControl
          editAction={this.toggleEdit}
          clearDraw={this.clearDraw}
          handleSubmit={this.handleSubmit}
          submit={this.state.showSubmit}  draw={true}/>}
      </>
    )
  }
}
Map.propTypes = {
  height: PropType.number
}
export default windowDimensions()(Map);
