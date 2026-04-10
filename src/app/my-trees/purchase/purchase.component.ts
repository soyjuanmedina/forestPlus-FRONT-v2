import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { 
  PlannedPlantationControllerService, 
  TreeTypeControllerService, 
  PurchaseControllerService,
  PlannedPlantationResponseDto, 
  TreeTypeResponseDto,
  PurchaseRequestDto
} from '../../api';
import { AuthService } from '../../services/auth.service';
import { RedsysService } from '../../services/redsys.service';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.css'
})
export class PurchaseComponent implements OnInit {
  step = 1;
  plantations: PlannedPlantationResponseDto[] = [];
  treeTypes: TreeTypeResponseDto[] = [];
  
  selectedPlantation: PlannedPlantationResponseDto | null = null;
  selectedTreeType: TreeTypeResponseDto | null = null;
  quantity = 1;
  
  isProcessing = false;
  
  // Precios simulados (v1 style)
  readonly DEFAULT_PRICE = 2.0;
  readonly SPECIAL_PRICES: { [key: number]: number } = {
    7: 10.0 // Ejemplo de v1
  };

  constructor(
    private plantationApi: PlannedPlantationControllerService,
    private treeTypeApi: TreeTypeControllerService,
    private purchaseApi: PurchaseControllerService,
    private authService: AuthService,
    private redsysService: RedsysService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPlantations();
    this.loadTreeTypes();
  }

  loadPlantations(): void {
    this.plantationApi.getPending().subscribe({
      next: (data) => {
        this.plantations = data;
        this.checkPreselectedPlantation();
      },
      error: (err) => console.error('Error loading plantations', err)
    });
  }

  private checkPreselectedPlantation(): void {
    const preselectedId = this.route.snapshot.queryParamMap.get('plantationId');
    if (preselectedId && this.plantations.length > 0) {
      const found = this.plantations.find(p => p.id === +preselectedId);
      if (found) {
        this.selectPlantation(found);
        this.step = 2; // Saltamos directamente a elegir cantidad
      }
    }
  }

  loadTreeTypes(): void {
    this.treeTypeApi.getAllTreeTypes().subscribe({
      next: (data) => this.treeTypes = data,
      error: (err) => console.error('Error loading tree types', err)
    });
  }

  selectPlantation(plantation: any): void {
    this.selectedPlantation = plantation;
    // Auto-seleccionamos el tipo de árbol vinculado a la plantación
    if (plantation.treeType) {
      this.selectedTreeType = plantation.treeType;
    } else if (plantation.treeTypeId) {
      // Fallback si solo viene el ID
      this.selectedTreeType = { id: plantation.treeTypeId } as any;
    }
  }

  selectTreeType(type: TreeTypeResponseDto): void {
    this.selectedTreeType = type;
  }

  changeQuantity(delta: number): void {
    this.quantity += delta;
    if (this.quantity < 1) this.quantity = 1;
  }

  nextStep(): void {
    if (this.step < 3) this.step++;
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  isStepValid(): boolean {
    if (this.step === 1) return !!this.selectedPlantation;
    if (this.step === 2) return this.quantity > 0;
    return true;
  }

  get unitPrice(): number {
    if (!this.selectedTreeType?.id) return this.DEFAULT_PRICE;
    return this.SPECIAL_PRICES[this.selectedTreeType.id] || this.DEFAULT_PRICE;
  }

  get totalPrice(): number {
    return this.quantity * this.unitPrice;
  }

  get estimatedCo2(): number {
    if (!this.selectedTreeType) return 0;
    // Usamos la absorción a los 20 años como referencia, o un valor por defecto
    return (this.selectedTreeType.co2AbsorptionAt20 || 10) * this.quantity;
  }

  confirmPurchase(): void {
    if (!this.selectedPlantation?.id || !this.selectedTreeType?.id) return;

    this.isProcessing = true;

    const request: PurchaseRequestDto = {
      landId: this.selectedPlantation.landId,
      plannedPlantationId: this.selectedPlantation.id,
      treeTypeId: this.selectedTreeType.id,
      quantity: this.quantity
    };

    // Simulamos el flujo de Redsys pero llamamos a la compra directa por ahora
    // En el futuro aquí se llamaría a createOrder -> createPayment -> sendToRedsys
    
    setTimeout(() => {
      this.purchaseApi.purchaseTrees(request).subscribe({
        next: () => {
          this.isProcessing = false;
          this.router.navigate(['/my-trees'], { queryParams: { purchased: 'true' } });
        },
        error: (err) => {
          this.isProcessing = false;
          console.error('Error in purchase', err);
          alert('Error al procesar la compra. Por favor, inténtalo de nuevo.');
        }
      });
    }, 1500); // Pequeña demora para simular proceso
  }
}
