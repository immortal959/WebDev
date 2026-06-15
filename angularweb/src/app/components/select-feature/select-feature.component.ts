import { OnInit, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MapService } from '../../services/map.service';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import WKT from 'ol/format/WKT';

@Component({
  selector: 'app-select-feature',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './select-feature.component.html',
  styleUrl: './select-feature.component.scss'
})
export class SelectFeatureComponent implements OnInit, OnDestroy {
  selectMode: boolean = false;
  private selectInteraction: Select | null = null;

  constructor(
    public mapService: MapService,
    public router: Router,
    public eventService: EventService
  ) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type !== 'selectActivated') {
        this.selectMode = false;
        this.selectInteraction?.setActive(false);
      }
    });
  }

  ngOnInit(): void {
    this.selectInteraction = new Select({
      condition: click,
      layers: [
        this.mapService.getLayerByTitle('Buildings vector') as any,
        this.mapService.getLayerByTitle('Streets vector') as any,
        this.mapService.getLayerByTitle('Points vector') as any
      ].filter(Boolean)
    });

    this.selectInteraction.on('select', (e) => {
        if (e.selected.length > 0) {
          const feature = e.selected[0];
          const geometry = feature.getGeometry();
          if (!geometry) return;
          const wkt = new WKT().writeGeometry(geometry);
          const geomType = geometry.getType();
          const featureId = feature.get('id');
      
          if (geomType === 'Polygon') {
            this.router.navigate(['/building-form'], { queryParams: { geom: wkt, id: featureId } });
          } else if (geomType === 'LineString') {
            this.router.navigate(['/street-form'], { queryParams: { geom: wkt, id: featureId } });
          } else if (geomType === 'Point') {
            this.router.navigate(['/point-form'], { queryParams: { geom: wkt, id: featureId } });
          }
      
          this.selectInteraction?.getFeatures().clear();
        }
      });


    this.mapService.map?.addInteraction(this.selectInteraction);
    this.selectInteraction.setActive(false);
  }

  toggleSelectMode(): void {
    this.selectMode = !this.selectMode;
    if (this.selectMode) {
      this.mapService.disableMapInteractions();
      this.selectInteraction?.setActive(true);
      this.eventService.emitEvent(new EventModel('selectActivated', {}));
    } else {
      this.selectInteraction?.setActive(false);
    }
  }

  ngOnDestroy(): void {
    if (this.selectInteraction) {
      this.mapService.map?.removeInteraction(this.selectInteraction);
    }
  }
}