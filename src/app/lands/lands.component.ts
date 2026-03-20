import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeService } from '../services/tree.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lands',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './lands.component.html',
  styleUrl: './lands.component.css'
})
export class LandsComponent implements OnInit {
  lands: any[] = [];
  loading = true;

  constructor(private treeService: TreeService) {}

  ngOnInit() {
    this.treeService.getLands().subscribe({
      next: (data) => {
        this.lands = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching lands', err);
        this.loading = false;
      }
    });
  }
}
