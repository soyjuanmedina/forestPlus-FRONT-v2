import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TreeService } from '../../services/tree.service';
import { AuthService } from '../../services/auth.service';
import { TreeResponseDto } from '../../api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tree-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './tree-detail.component.html',
  styleUrl: './tree-detail.component.css'
})
export class TreeDetailComponent implements OnInit {
  tree?: TreeResponseDto;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treeService: TreeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.treeService.getTreeById(id).subscribe({
        next: (tree) => {
          this.tree = tree;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  getOwner(): string {
    if (this.tree?.ownerCompanyName) return this.tree.ownerCompanyName;
    if (this.tree?.ownerUserName) return this.tree.ownerUserName;
    return 'Sin propietario';
  }

  goToEdit(): void {
    if (this.tree?.id) {
      this.router.navigate(['/tree/form', this.tree.id]);
    }
  }

  get canEdit(): boolean {
    const role = this.authService.getRole();
    return role !== 'COMPANY_USER';
  }
}
