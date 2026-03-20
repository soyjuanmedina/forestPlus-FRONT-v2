import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TreeService } from '../../services/tree.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tree-species-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './tree-species-detail.component.html',
  styles: [`
    .detail-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .hero-image { width: 100%; height: 350px; object-fit: cover; }
    .content-area { padding: 3rem; }
    .stats-box { background: #f8f9fa; border-radius: 12px; padding: 1.5rem; text-align: center; }
  `]
})
export class TreeSpeciesDetailComponent implements OnInit {
  species: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treeService: TreeService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.treeService.getTreeSpeciesById(+idParam).subscribe({
        next: (data) => {
          this.species = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/tree-species']);
        }
      });
    }
  }
}
