import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { HelpComponent } from './components/help/help.component';
import { HomeComponent } from './components/home/home.component';
import { BuildingFormComponent } from './components/forms/building-form/building-form.component';
import { StreetFormComponent } from './components/forms/street-form/street-form.component';
import { PointFormComponent } from './components/forms/point-form/point-form.component';
import { LoginFormComponent } from './components/forms/login-form/login-form.component';
import { LogoutFormComponent } from './components/forms/logout-form/logout-form.component';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'help', component: HelpComponent},
    {path: 'map', component: MapComponent},
    {path: 'building-form', component: BuildingFormComponent},
    {path: 'street-form', component: StreetFormComponent},
    {path: 'point-form', component: PointFormComponent},
    {path: 'login-form', component: LoginFormComponent},
    {path: 'logout-form', component: LogoutFormComponent},
];
