import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LandResponseDto, PlannedPlantationResponseDto, TreeTypeResponseDto } from '../../api';
import { TreeService } from '../../services/tree.service';
import { PlannedPlantationService } from '../../services/planned-plantation.service';

@Component({
  selector: 'app-assign-trees-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './assign-trees-modal.component.html',
  styleUrl: './assign-trees-modal.component.css'
})
export class AssignTreesModalComponent implements OnInit {
  @Input() userId?: number;
  @Input() companyId?: number;
  @Output() close = new EventEmitter<void>();
  @Output() assigned = new EventEmitter<any>();

  form: FormGroup;
  lands: LandResponseDto[] = [];
  plannedPlantations: PlannedPlantationResponseDto[] = [];
  treeTypes: TreeTypeResponseDto[] = [];
  isSubmitting = false;
  loadingLands = true;
  loadingPlantations = false;
  hasSelectedLand = false;

  constructor(
    private fb: FormBuilder,
    private treeService: TreeService,
    private plannedPlantationService: PlannedPlantationService
  ) {
    this.form = this.fb.group({
      landId: [null, Validators.required],
      plannedPlantationId: [null, Validators.required],
      treeTypeId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.treeService.getLands().subscribe({
      next: (lands) => {
        this.lands = lands;
        this.loadingLands = false;
      },
      error: () => this.loadingLands = false
    });
    this.treeService.getTreeSpecies().subscribe(types => this.treeTypes = types);
  }

  onLandChange(event: Event): void {
    const landId = Number((event.target as HTMLSelectElement).value);
    
    this.form.patchValue({
      plannedPlantationId: null,
      quantity: null
    });
    this.plannedPlantations = [];

    this.hasSelectedLand = !!landId;

    if (landId) {
      this.loadingPlantations = true;
      this.plannedPlantationService.getByLand(landId)
        .subscribe({
          next: (pp) => {
            this.plannedPlantations = pp;
            this.loadingPlantations = false;
          },
          error: () => this.loadingPlantations = false
        });
    }
  }

  isLandFull(land: LandResponseDto): boolean {
    return (land.maxTrees || 0) <= (land.plantedTreesCount || 0);
  }

  isPlantationFull(pp: PlannedPlantationResponseDto): boolean {
    return (pp.maxTrees || 0) <= (pp.purchasedTrees || 0);
  }

  getRemainingCapacity(): number | null {
    const landId = this.form.get('landId')?.value;
    const ppId = this.form.get('plannedPlantationId')?.value;
    
    if (!landId || !ppId) return null;
    
    const land = this.lands.find(l => l.id === Number(landId));
    const pp = this.plannedPlantations.find(p => p.id === Number(ppId));
    
    if (!land || !pp) return null;
    
    const landRemaining = (land.maxTrees || 0) - (land.plantedTreesCount || 0);
    const ppRemaining = (pp.maxTrees || 0) - (pp.purchasedTrees || 0);
    
    return Math.max(0, Math.min(landRemaining, ppRemaining));
  }

  get isCapacityExceeded(): boolean {
    const remaining = this.getRemainingCapacity();
    const quantity = this.form.get('quantity')?.value;
    return remaining !== null && quantity !== null && quantity > remaining;
  }

  submit(): void {
    if (this.form.invalid || this.isCapacityExceeded) return;

    this.isSubmitting = true;
    const payload = {
      ownerUserId: this.userId,
      ownerCompanyId: this.companyId,
      ...this.form.value
    };

    this.assigned.emit(payload);
  }
}
