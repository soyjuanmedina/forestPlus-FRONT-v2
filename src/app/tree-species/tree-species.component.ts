import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeService } from '../services/tree.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tree-species',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './tree-species.component.html',
  styles: [`
    .glass-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .btn { padding: 8px 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: inline-block; text-align: center; }
    .btn-primary { background: var(--color-primary); color: white; border: none; }
    .btn-primary:hover { opacity: 0.9; }
  `]
})
export class TreeSpeciesComponent implements OnInit {
  speciesList: any[] = [];
  loading = true;

  constructor(private treeService: TreeService) {}

  ngOnInit() {
    this.treeService.getTreeSpecies().subscribe({
      next: (data) => {
        this.speciesList = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching tree species', err);
        this.loading = false;
      }
    });
  }
}
