import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import { MapService } from '../../services/map.service';
import { DrawBuildingComponent } from '../draw-building/draw-building.component';
import { DrawStreetComponent } from '../draw-street/draw-street.component';
import { DrawPointComponent } from '../draw-point/draw-point.component';
import { SelectFeatureComponent } from '../select-feature/select-feature.component';
import { ApiService } from '../../services/api.service';
import { ServerAnswerModel } from '../../models/server-answer.model';
import { EditFeatureComponent } from '../edit-feature/edit-feature.component';
import WKT from 'ol/format/WKT';
import Feature from 'ol/Feature';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [DrawBuildingComponent, DrawStreetComponent, DrawPointComponent, SelectFeatureComponent, EditFeatureComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  constructor(public mapService: MapService, private apiService: ApiService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log('mapComponent initialized');
    this.mapService.map.setTarget(this.mapContainer.nativeElement);
    console.log('Map linked to DOM');
    this.loadAllGeometries();
  }

  loadAllGeometries(): void {
    const wktFormat = new WKT();

    this.apiService.get('webcrud/building/selectall/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) {
          const source = this.mapService.getLayerByTitle('Buildings vector')?.getSource();
          if (source) {
            source.clear();
            response.data.forEach((item: any) => {
              try {
                const geometry = wktFormat.readGeometry(item.geom);
                const feature = new Feature({ geometry: geometry });
                feature.setProperties({ id: item.id, name: item.name, layerType: 'building' });
                source.addFeature(feature);
              } catch (e) { console.log('Error parsing building geometry:', e); }
            });
          }
        }
      },
      error: (error: any) => { console.log(error); }
    });

    this.apiService.get('webcrud/street/selectall/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) {
          const source = this.mapService.getLayerByTitle('Streets vector')?.getSource();
          if (source) {
            source.clear();
            response.data.forEach((item: any) => {
              try {
                const geometry = wktFormat.readGeometry(item.geom);
                const feature = new Feature({ geometry: geometry });
                feature.setProperties({ id: item.id, name: item.name, layerType: 'street' });
                source.addFeature(feature);
              } catch (e) { console.log('Error parsing street geometry:', e); }
            });
          }
        }
      },
      error: (error: any) => { console.log(error); }
    });

    this.apiService.get('webcrud/point/selectall/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) {
          const source = this.mapService.getLayerByTitle('Points vector')?.getSource();
          if (source) {
            source.clear();
            response.data.forEach((item: any) => {
              try {
                const geometry = wktFormat.readGeometry(item.geom);
                const feature = new Feature({ geometry: geometry });
                feature.setProperties({ id: item.id, name: item.name, layerType: 'point' });
                source.addFeature(feature);
              } catch (e) { console.log('Error parsing point geometry:', e); }
            });
          }
        }
      },
      error: (error: any) => { console.log(error); }
    });
  }

  ngOnDestroy(): void {
    if (this.mapService.map) {
      this.mapService.map.setTarget(undefined);
      console.log('Map unlinked from DOM');
    }
  }
}