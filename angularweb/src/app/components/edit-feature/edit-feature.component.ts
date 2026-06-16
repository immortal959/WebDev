import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import { Modify, Select, Snap } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { Collection } from 'ol';
import Feature from 'ol/Feature';

@Component({
  selector: 'app-edit-feature',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './edit-feature.component.html',
  styleUrl: './edit-feature.component.scss'
})
export class EditFeatureComponent implements OnInit, OnDestroy {
  editMode: boolean = false;
  private selectForEdit: Select | null = null;
  private modifyInteraction: Modify | null = null;
  private snapInteraction: Snap | null = null;

  constructor(
    public mapService: MapService,
    public eventService: EventService
  ) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type !== 'editActivated') {
        this.editMode = false;
        this.selectForEdit?.setActive(false);
        this.modifyInteraction?.setActive(false);
      }
    });
  }

  ngOnInit(): void {
    const selectedFeatures = new Collection<Feature>();

    this.selectForEdit = new Select({
      condition: click,
      layers: [
        this.mapService.getLayerByTitle('Buildings vector') as any,
        this.mapService.getLayerByTitle('Streets vector') as any,
        this.mapService.getLayerByTitle('Points vector') as any
      ].filter(Boolean),
      features: selectedFeatures
    });

    this.modifyInteraction = new Modify({
      features: selectedFeatures
    });

    this.mapService.map?.addInteraction(this.selectForEdit);
    this.mapService.map?.addInteraction(this.modifyInteraction);
    this.selectForEdit.setActive(false);
    this.modifyInteraction.setActive(false);

    // Add Snap interaction for all vector layers
    const buildingSource = this.mapService.getLayerByTitle('Buildings vector')?.getSource();
    const streetSource = this.mapService.getLayerByTitle('Streets vector')?.getSource();
    const pointSource = this.mapService.getLayerByTitle('Points vector')?.getSource();
    
    if (buildingSource) {
      const snapBuilding = new Snap({ source: buildingSource as any });
      this.mapService.map?.addInteraction(snapBuilding);
    }
    if (streetSource) {
      const snapStreet = new Snap({ source: streetSource as any });
      this.mapService.map?.addInteraction(snapStreet);
    }
    if (pointSource) {
      const snapPoint = new Snap({ source: pointSource as any });
      this.mapService.map?.addInteraction(snapPoint);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.mapService.disableMapInteractions();
      this.selectForEdit?.setActive(true);
      this.modifyInteraction?.setActive(true);
      this.eventService.emitEvent(new EventModel('editActivated', {}));
    } else {
      this.selectForEdit?.setActive(false);
      this.modifyInteraction?.setActive(false);
      this.selectForEdit?.getFeatures().clear();
    }
  }

  ngOnDestroy(): void {
    if (this.selectForEdit) {
      this.mapService.map?.removeInteraction(this.selectForEdit);
    }
    if (this.modifyInteraction) {
      this.mapService.map?.removeInteraction(this.modifyInteraction);
    }
  }
}