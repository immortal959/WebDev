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
  selector: 'app-draw-street',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-street.component.html',
  styleUrl: './draw-street.component.scss'
})
export class DrawStreetComponent implements AfterViewInit, OnDestroy{
  drawMode: boolean = false;
  drawStreet: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      console.log("Event received in DrawStreetComponent:", event.type);
      if (event.type != 'drawStreetActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    console.log("DrawStreetComponent initialized");
    this.addDrawStreetInteraction();
    this.disableDrawStreets();
    this.reloadStreetsWmsLayer();
  }

  toggleDrawMode(){
    this.drawMode = !this.drawMode;
    if(this.drawMode){
      this.enableDrawStreets();
      console.log("Street drawing mode activated");
    } else {
      this.disableDrawStreets();
      this.clearVectorLayer();
      this.reloadStreetsWmsLayer();
      console.log("Street drawing mode deactivated");
    }
  }

  addDrawStreetInteraction() {
    var sourceStreets: VectorSource = this.mapService.getLayerByTitle('Streets vector')?.getSource();
    if(sourceStreets){
      this.drawStreet = new Draw({
        source: sourceStreets,
        type: ('LineString')
      });
      this.drawStreet.on('drawend', this.manageDrawEnd);
      this.mapService.map!.addInteraction(this.drawStreet);
    }else{
      console.error("Error: Streets vector layer not found");
    }
  }

  enableDrawStreets(){
    this.mapService.disableMapInteractions();
    this.drawStreet!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawStreetActivated', {}));
  }

  disableDrawStreets(){
    this.drawStreet!.setActive(false);
  }

  clearVectorLayer(){
    this.mapService.getLayerByTitle('Streets vector')?.getSource().clear();
  }

  reloadStreetsWmsLayer(){
    this.mapService.getLayerByTitle('Streets WMS')?.getSource().updateParams({"time": Date.now()})
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation  = wktFormat.writeGeometry(feature.getGeometry()!);
    console.log(wktRepresentation);
    this.router.navigate(['/street-form'], { queryParams: {geom: wktRepresentation }});
  }

  ngOnDestroy(): void {
    if (this.drawStreet) {
      this.mapService.map?.removeInteraction(this.drawStreet);
      console.log("Draw street interaction removed");
    }
  }
}
