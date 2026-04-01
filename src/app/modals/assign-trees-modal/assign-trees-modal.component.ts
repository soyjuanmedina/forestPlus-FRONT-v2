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
    this.treeService.getLands().subscribe(lands => this.lands = lands);
    this.treeService.getTreeSpecies().subscribe(types => this.treeTypes = types);
  }

  onLandChange(event: Event): void {
    const landId = Number((event.target as HTMLSelectElement).value);
    
    this.form.patchValue({
      plannedPlantationId: null,
      quantity: null
    });
    this.plannedPlantations = [];

    if (landId) {
      this.plannedPlantationService.getByLand(landId)
        .subscribe(pp => this.plannedPlantations = pp);
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const payload = {
      ownerUserId: this.userId,
      ownerCompanyId: this.companyId,
      ...this.form.value
    };

    this.assigned.emit(payload);
  }
}
