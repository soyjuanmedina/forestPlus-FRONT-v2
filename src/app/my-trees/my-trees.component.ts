import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeService } from '../services/tree.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-my-trees',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './my-trees.component.html',
  styleUrl: './my-trees.component.css'
})
export class MyTreesComponent implements OnInit {
  trees: any[] = [];
  loading = true;

  constructor(private treeService: TreeService) {}

  ngOnInit() {
    this.treeService.getMyTrees().subscribe({
      next: (data) => {
        this.trees = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching trees', err);
        this.loading = false;
      }
    });
  }
}
