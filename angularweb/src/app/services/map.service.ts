import { Injectable } from '@angular/core';

//OpenLayers
import Map from 'ol/Map';
import View from 'ol/View';
import Layer from 'ol/layer/Layer';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { Projection } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import MousePosition from 'ol/control/MousePosition.js';
import {createStringXY} from 'ol/coordinate.js';
import Interaction from 'ol/interaction/Interaction';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
import DragPan from 'ol/interaction/DragPan';

//vector layers
import { Vector as VectorLayer} from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
//layerswitcher
import LayerSwitcher from 'ol-layerswitcher';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  map: Map;
  baseLayersGroup:LayerGroup;
  myLayersGroup:LayerGroup;

  constructor(public settingsService: SettingsService) {
      this.baseLayersGroup= this.createBaseLayers();
      this.myLayersGroup= this.createMyLayers();
      this.map= this.createMap();
      this.addLayerSwitcherControl();
      this.addMousePositionControl();
  }

  createBaseLayers(): LayerGroup {
    var pnoa = new TileLayer({
      properties: {
            title: 'PNOA WMS'
          },
      source: new TileWMS(({
        url: "https://www.ign.es/wms-inspire/pnoa-ma?",
        params: {"LAYERS": "OI.OrthoimageCoverage", 'VERSION': "1.3.0", "TILED": "true", "TYPE": 'base', "FORMAT": "image/png"},
      }))
    });

    var catastro= new TileLayer({
          properties: {
            title: 'Cadastre WMS',
          },
          source: new TileWMS({
          url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?',
          params: {
            'LAYERS': 'Catastro', 'VERSION': '1.1.1', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png'
          }
        })
      });

    const baseLayersGroup = new LayerGroup({
        properties: {
          title: 'Base Layers',
        },
        layers: [pnoa, catastro]
      });
     return baseLayersGroup;
  }

  createMyLayers(): LayerGroup {
    // --- BUILDINGS (Polygon) ---
    var buildings= new TileLayer({
        properties: {
          title: 'Buildings WMS'
        },
        source: new TileWMS({
          url: this.settingsService.GEOSERVER_URL + 'wms?',
          params: {
            // Change 'myworkspace' to your GeoServer workspace name
            'LAYERS': 'myworkspace:web_proj_building', 'VERSION': '1.3.0', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png'
          }
        })
      });
    var buildingsVectorSource = new VectorSource({wrapX: false});
    var buildingsVectorLayer = new VectorLayer({
      source: buildingsVectorSource,
      properties: {
        title: 'Buildings vector'
      }
    });

    // --- STREETS (LineString) ---
    var streets= new TileLayer({
        properties: {
          title: 'Streets WMS'
        },
        source: new TileWMS({
          url: this.settingsService.GEOSERVER_URL + 'wms?',
          params: {
            'LAYERS': 'myworkspace:web_proj_street', 'VERSION': '1.3.0', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png'
          }
        })
      });
    var streetsVectorSource = new VectorSource({wrapX: false});
    var streetsVectorLayer = new VectorLayer({
      source: streetsVectorSource,
      properties: {
        title: 'Streets vector'
      }
    });

    // --- POINTS (Point) ---
    var points= new TileLayer({
        properties: {
          title: 'Points WMS'
        },
        source: new TileWMS({
          url: this.settingsService.GEOSERVER_URL + 'wms?',
          params: {
            'LAYERS': 'myworkspace:web_proj_point', 'VERSION': '1.3.0', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png'
          }
        })
      });
    var pointsVectorSource = new VectorSource({wrapX: false});
    var pointsVectorLayer = new VectorLayer({
      source: pointsVectorSource,
      properties: {
        title: 'Points vector'
      }
    });

    var myLayersGroup = new LayerGroup({
        properties: {
          title: 'My layers'
        },
        layers: [buildings, buildingsVectorLayer, streets, streetsVectorLayer, points, pointsVectorLayer]
      });
    return myLayersGroup;
  }

  createMap(): Map {
    let epsg25830:Projection;
    epsg25830=new Projection({
      code:'EPSG:25830',
      extent: [-729785.76,3715125.82,945351.10,9522561.39],
      units: 'm'
    });
    var map: Map = new Map({
      controls: [],
      view: new View({
        center: [729035,4373419],
        zoom: 14,
        projection: epsg25830,
      }),
      layers: [this.baseLayersGroup, this.myLayersGroup],
      target: undefined
    });
    return map;
  }

  addLayerSwitcherControl() {
    const layerSwitcher = new LayerSwitcher(
      {
        activationMode: 'mouseover',
        startActive: true,
        tipLabel: 'Show-hide layers',
        groupSelectStyle: 'group',
        reverse: false
      }
    );
    this.map.addControl(layerSwitcher);
  }

  addMousePositionControl(){
      const mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(0),
        projection: 'EPSG:25830',
      });
      this.map.addControl(mousePositionControl);
  }

  getLayerByTitle(title: string, layers?: BaseLayer[]): Layer<any> | undefined {
    const currentLayers = layers || this.map.getLayers().getArray();

    for (const baseLayer of currentLayers) {
      if (this.isLayer(baseLayer)) {
        const layerProperties = baseLayer.getProperties();
        if (layerProperties && layerProperties['title'] === title) {
          return baseLayer;
        }
      }
      else if (this.isLayerGroup(baseLayer)) {
        const foundLayerInGroup = this.getLayerByTitle(title, baseLayer.getLayers().getArray());
        if (foundLayerInGroup) {
          return foundLayerInGroup;
        }
      }
    }
    return undefined;
  }

  private isLayer(layer: BaseLayer): layer is Layer<any> {
    return (layer as Layer<any>).getSource !== undefined;
  }

  private isLayerGroup(layer: BaseLayer): layer is LayerGroup {
    return (layer as LayerGroup).getLayers !== undefined;
  }

  disableMapInteractions(): void {
    if (this.map) {
      this.map.getInteractions().forEach((interaction: Interaction) => {
        if (!(interaction instanceof MouseWheelZoom) && !(interaction instanceof DragPan)) {
          interaction.setActive(false);
        }
      });
    }
  }
}
