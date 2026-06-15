import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';

import {Draw} from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import {WKT} from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

@Component({
  selector: 'app-draw-building',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-building.component.html',
  styleUrl: './draw-building.component.scss'
})
export class DrawBuildingComponent implements AfterViewInit, OnDestroy{
  drawMode: boolean = false;
  drawBuilding: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      console.log("Event received in DrawBuildingComponent:", event.type);
      if (event.type != 'drawBuildingActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    console.log("DrawBuildingComponent initialized");
    this.addDrawBuildingInteraction();
    this.disableDrawBuildings();
    this.reloadBuildingsWmsLayer();
  }

  toggleDrawMode(){
    this.drawMode = !this.drawMode;
    if(this.drawMode){
      this.enableDrawBuildings();
      console.log("Drawing mode activated");
    } else {
      this.disableDrawBuildings();
      this.clearVectorLayer();
      this.reloadBuildingsWmsLayer();
      console.log("Drawing mode deactivated");
    }
  }

  addDrawBuildingInteraction() {
    var sourceBuildings: VectorSource = this.mapService.getLayerByTitle('Buildings vector')?.getSource();
    if(sourceBuildings){
      this.drawBuilding = new Draw({
        source: sourceBuildings,
        type: ('Polygon')
      });
      this.drawBuilding.on('drawend', this.manageDrawEnd);
      this.mapService.map!.addInteraction(this.drawBuilding);
    }else{
      console.error("Error: Buildings vector layer not found");
    }
  }

  enableDrawBuildings(){
    this.mapService.disableMapInteractions();
    this.drawBuilding!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawBuildingActivated', {}));
  }

  disableDrawBuildings(){
    this.drawBuilding!.setActive(false);
  }

  clearVectorLayer(){
    this.mapService.getLayerByTitle('Buildings vector')?.getSource().clear();
  }

  reloadBuildingsWmsLayer(){
    this.mapService.getLayerByTitle('Buildings WMS')?.getSource().updateParams({"time": Date.now()})
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation  = wktFormat.writeGeometry(feature.getGeometry()!);
    console.log(wktRepresentation);
    this.router.navigate(['/building-form'], { queryParams: {geom: wktRepresentation }});
  }

  ngOnDestroy(): void {
    if (this.drawBuilding) {
      this.mapService.map?.removeInteraction(this.drawBuilding);
      console.log("Draw building interaction removed");
    }
  }
}
