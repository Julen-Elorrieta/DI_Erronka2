import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { EducationalCenter } from '../../core/models/center.model';

interface DialogData {
  center: EducationalCenter;
}

@Component({
  selector: 'app-center-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>business</mat-icon>
      {{ data.center.name }}
    </h2>
    
    <mat-dialog-content>
      <div class="center-details">
        <div class="detail-item">
          <mat-icon>badge</mat-icon>
          <div>
            <label>{{ 'CENTER.CODE' | translate }}</label>
            <span>{{ data.center.code }}</span>
          </div>
        </div>

        <div class="detail-item">
          <mat-icon>category</mat-icon>
          <div>
            <label>{{ 'FILTER.TITULARIDAD' | translate }}</label>
            <span class="badge" [ngClass]="'tit-' + data.center.dtituc.toLowerCase()">
              {{ data.center.dtituc }}
            </span>
          </div>
        </div>

        <div class="detail-item">
          <mat-icon>map</mat-icon>
          <div>
            <label>{{ 'FILTER.TERRITORIO' | translate }}</label>
            <span>{{ data.center.dterr }}</span>
          </div>
        </div>

        <div class="detail-item">
          <mat-icon>location_city</mat-icon>
          <div>
            <label>{{ 'FILTER.MUNICIPIO' | translate }}</label>
            <span>{{ data.center.dmunic }}</span>
          </div>
        </div>

        <div class="detail-item">
          <mat-icon>place</mat-icon>
          <div>
            <label>{{ 'CENTER.ADDRESS' | translate }}</label>
            <span>{{ data.center.address }}</span>
            <span class="secondary">{{ data.center.postalCode }}</span>
          </div>
        </div>

        @if (data.center.phone) {
          <div class="detail-item">
            <mat-icon>phone</mat-icon>
            <div>
              <label>{{ 'CENTER.PHONE' | translate }}</label>
              <a href="tel:{{ data.center.phone }}">{{ data.center.phone }}</a>
            </div>
          </div>
        }

        @if (data.center.email) {
          <div class="detail-item">
            <mat-icon>email</mat-icon>
            <div>
              <label>{{ 'CENTER.EMAIL' | translate }}</label>
              <a href="mailto:{{ data.center.email }}">{{ data.center.email }}</a>
            </div>
          </div>
        }

        @if (data.center.coordinates) {
          <div class="detail-item">
            <mat-icon>my_location</mat-icon>
            <div>
              <label>{{ 'CENTER.COORDINATES' | translate }}</label>
              <span class="coordinates">
                {{ data.center.coordinates.latitude.toFixed(4) }}, 
                {{ data.center.coordinates.longitude.toFixed(4) }}
              </span>
            </div>
          </div>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (data.center.coordinates) {
        <a mat-button 
           [href]="getGoogleMapsUrl()" 
           target="_blank"
           color="primary">
          <mat-icon>directions</mat-icon>
          {{ 'CENTER.OPEN_MAPS' | translate }}
        </a>
      }
      <button mat-raised-button mat-dialog-close color="primary">
        {{ 'COMMON.CLOSE' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--primary-color);
    }
    
    .center-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }
    
    .detail-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    
    .detail-item mat-icon {
      color: var(--primary-color);
      margin-top: 2px;
    }
    
    .detail-item div {
      display: flex;
      flex-direction: column;
    }
    
    .detail-item label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .detail-item span,
    .detail-item a {
      font-size: 1rem;
      color: var(--text-primary);
    }
    
    .detail-item a {
      color: var(--primary-color);
      text-decoration: none;
    }
    
    .detail-item a:hover {
      text-decoration: underline;
    }
    
    .secondary {
      font-size: 0.85rem !important;
      color: var(--text-secondary) !important;
    }
    
    .coordinates {
      font-family: monospace;
      font-size: 0.9rem !important;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8rem !important;
      width: fit-content;
    }
    
    .tit-público {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .tit-privado {
      background-color: #fce4ec;
      color: #c62828;
    }
    
    .tit-concertado {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    mat-dialog-content {
      max-height: 70vh;
    }
    
    @media (max-width: 480px) {
      .center-details {
        min-width: auto;
      }
    }
  `]
})
export class CenterDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CenterDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  getGoogleMapsUrl(): string {
    if (this.data.center.coordinates) {
      const { latitude, longitude } = this.data.center.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    return '#';
  }
}
