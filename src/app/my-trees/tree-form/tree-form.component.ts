import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TreeResponseDto, TreeUpdateRequestDto, PlannedPlantationResponseDto } from '../../api';
import { TreeService } from '../../services/tree.service';
import { PlannedPlantationService } from '../../services/planned-plantation.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tree-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule],
  templateUrl: './tree-form.component.html',
  styleUrl: './tree-form.component.css'
})
export class TreeFormComponent implements OnInit {
  treeForm!: FormGroup;
  tree!: TreeResponseDto;
  isAdmin = false;
  loading = true;

  plannedPlantations: PlannedPlantationResponseDto[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private treeService: TreeService,
    private plannedPlantationService: PlannedPlantationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.treeService.getTreeById(+id).subscribe({
        next: (tree) => {
          this.tree = tree;
          if (tree.land?.id && this.isAdmin) {
            this.loadPlannedPlantations(tree.land.id);
          }
          this.initForm();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  private loadPlannedPlantations(landId: number): void {
    this.plannedPlantationService.getByLand(landId).subscribe((res: PlannedPlantationResponseDto[]) => {
      this.plannedPlantations = res;
    });
  }

  private initForm(): void {
    this.treeForm = this.fb.group({
      customName: [this.tree.customName || ''],
      treeTypeName: [{ value: this.tree.treeType?.name, disabled: true }],
      scientificName: [{ value: this.tree.scientificName, disabled: true }],
      co2AbsorptionAt20: [{ value: this.tree.co2AbsorptionAt20, disabled: !this.isAdmin }, [Validators.required, Validators.min(0)]],
      co2AbsorptionAt25: [{ value: this.tree.co2AbsorptionAt25, disabled: !this.isAdmin }, [Validators.min(0)]],
      co2AbsorptionAt30: [{ value: this.tree.co2AbsorptionAt30, disabled: !this.isAdmin }, [Validators.min(0)]],
      co2AbsorptionAt35: [{ value: this.tree.co2AbsorptionAt35, disabled: !this.isAdmin }, [Validators.min(0)]],
      co2AbsorptionAt40: [{ value: this.tree.co2AbsorptionAt40, disabled: !this.isAdmin }, [Validators.min(0)]],
      plantedAt: [{ value: this.tree.plantedAt, disabled: !this.isAdmin }],
      landName: [{ value: this.tree.land?.name, disabled: true }],
      ownerName: [{ value: this.tree.ownerUserName, disabled: true }],
      plannedPlantationId: [{ value: this.tree.plannedPlantation?.id || null, disabled: !this.isAdmin }]
    });
  }

  save(): void {
    if (!this.treeForm.valid) return;

    // Convert string empty values to null for integers/dates if necessary
    const updateDto: TreeUpdateRequestDto = {
      customName: this.treeForm.get('customName')?.value,
      co2AbsorptionAt20: this.treeForm.get('co2AbsorptionAt20')?.value,
      co2AbsorptionAt25: this.treeForm.get('co2AbsorptionAt25')?.value,
      co2AbsorptionAt30: this.treeForm.get('co2AbsorptionAt30')?.value,
      co2AbsorptionAt35: this.treeForm.get('co2AbsorptionAt35')?.value,
      co2AbsorptionAt40: this.treeForm.get('co2AbsorptionAt40')?.value,
      plantedAt: this.treeForm.get('plantedAt')?.value || undefined,
      plannedPlantationId: this.treeForm.get('plannedPlantationId')?.value
    };

    if (this.tree.id) {
      this.treeService.updateTree(this.tree.id, updateDto).subscribe(() => {
        this.router.navigate(['/tree', this.tree.id]);
      });
    }
  }

  cancel(): void {
    if (this.tree?.id) {
      this.router.navigate(['/tree', this.tree.id]);
    } else {
      this.router.navigate(['/my-trees']);
    }
  }
}
