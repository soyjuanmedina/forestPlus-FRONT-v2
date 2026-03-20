import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TreeService } from '../../services/tree.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-land-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './land-detail.component.html',
  styleUrl: './land-detail.component.css'
})
export class LandDetailComponent implements OnInit {
  land: any;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private treeService: TreeService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadLand(+id);
      } else {
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadLand(id: number) {
    this.treeService.getLand(id).subscribe({
      next: (data) => {
        this.land = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching land details', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
