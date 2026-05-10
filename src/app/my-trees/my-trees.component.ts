import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeService } from '../services/tree.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-my-trees',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './my-trees.component.html',
  styleUrl: './my-trees.component.css'
})
export class MyTreesComponent implements OnInit {
  trees: any[] = [];
  totalCo2: number = 0;
  loading = true;
  features = environment.features;

  constructor(private treeService: TreeService) {}

  ngOnInit() {
    this.treeService.getMyTrees().subscribe({
      next: (data) => {
        this.trees = data;
        this.totalCo2 = this.trees.reduce((acc, tree) => acc + (tree.co2AbsorptionAt20 || 0), 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching trees', err);
        this.loading = false;
      }
    });
  }
}
