import {OnInit, Component, OnDestroy } from '@angular/core';
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
  selector: 'app-draw-point',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-point.component.html',
  styleUrl: './draw-point.component.scss'
})
export class DrawPointComponent implements OnInit, OnDestroy{
  drawMode: boolean = false;
  drawPoint: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      console.log("Event received in DrawPointComponent:", event.type);
      if (event.type != 'drawPointActivated') {
        this.drawMode = false;
      }
    });
  }

  ngOnInit(): void {
    console.log("DrawPointComponent initialized");
    this.addDrawPointInteraction();
    this.disableDrawPoints();
    this.reloadPointsWmsLayer();
  }

  toggleDrawMode(){
    this.drawMode = !this.drawMode;
    if(this.drawMode){
      this.enableDrawPoints();
      console.log("Point drawing mode activated");
    } else {
      this.disableDrawPoints();
      this.clearVectorLayer();
      this.reloadPointsWmsLayer();
      console.log("Point drawing mode deactivated");
    }
  }

  addDrawPointInteraction() {
    var sourcePoints: VectorSource = this.mapService.getLayerByTitle('Points vector')?.getSource();
    if(sourcePoints){
      this.drawPoint = new Draw({
        source: sourcePoints,
        type: ('Point')
      });
      this.drawPoint.on('drawend', this.manageDrawEnd);
      this.mapService.map!.addInteraction(this.drawPoint);
    }else{
      console.error("Error: Points vector layer not found");
    }
  }

  enableDrawPoints(){
    this.mapService.disableMapInteractions();
    this.drawPoint!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawPointActivated', {}));
  }

  disableDrawPoints(){
    this.drawPoint!.setActive(false);
  }

  clearVectorLayer(){
    this.mapService.getLayerByTitle('Points vector')?.getSource().clear();
  }

  reloadPointsWmsLayer(){
    this.mapService.getLayerByTitle('Points WMS')?.getSource().updateParams({"time": Date.now()})
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation  = wktFormat.writeGeometry(feature.getGeometry()!);
    console.log(wktRepresentation);
    this.router.navigate(['/point-form'], { queryParams: {geom: wktRepresentation }});
  }

  ngOnDestroy(): void {
    if (this.drawPoint) {
      this.mapService.map?.removeInteraction(this.drawPoint);
      console.log("Draw point interaction removed");
    }
  }
}
