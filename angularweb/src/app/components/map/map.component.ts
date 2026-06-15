import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';

//My imports
import { MapService } from '../../services/map.service';
import { DrawBuildingComponent } from '../draw-building/draw-building.component';
import { DrawStreetComponent } from '../draw-street/draw-street.component';
import { DrawPointComponent } from '../draw-point/draw-point.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [DrawBuildingComponent, DrawStreetComponent, DrawPointComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  constructor(public mapService: MapService) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log('mapComponent initialized');
    this.mapService.map.setTarget(this.mapContainer.nativeElement);
    console.log('Map linked to DOM');
  }

  ngOnDestroy(): void {
    if (this.mapService.map) {
      this.mapService.map.setTarget(undefined);
      console.log('Map unlinked from DOM');
    }
  }
}
