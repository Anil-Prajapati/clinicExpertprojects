import { CommonModule, DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import {Component,OnInit,OnDestroy,Inject,PLATFORM_ID,} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subscription, interval } from 'rxjs';
import { AuthService } from '../core/core/services/auth.service';
export interface InventoryItem {id: number;name: string;category: string;quantity: number;minStock: number;unit: string;price: number;expiryDate: string;supplier: string;batchNumber: string;lastUpdated: Date;status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';location?: string;reorderPoint?: number;}
export interface DashboardMetrics {totalItems: number;totalValue: number;lowStockCount: number;expiredCount: number;nearExpiryCount: number;outOfStockCount: number;}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent implements OnInit, OnDestroy {
  // Observables
  private inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
  public inventory$ = this.inventorySubject.asObservable();

  private metricsSubject = new BehaviorSubject<DashboardMetrics>({totalItems: 0,totalValue: 0,lowStockCount: 0,expiredCount: 0,nearExpiryCount: 0,outOfStockCount: 0,});
  public metrics$ = this.metricsSubject.asObservable();

  // UI State
  searchTerm: string = '';
  role: string | null = '';
  selectedCategory: string = 'All Categories';
  selectedStatus: string = 'All Status';
  sortBy: string = 'name';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showUploadModal: boolean = false;
  isEditMode: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  paginatedInventory: InventoryItem[] = [];

  // Data
  filteredInventory: InventoryItem[] = [];
  metrics: DashboardMetrics = {totalItems: 0,totalValue: 0,lowStockCount: 0,expiredCount: 0,nearExpiryCount: 0,outOfStockCount: 0,};
  categories: string[] = ['All Categories','Medical Supplies','Medicines','Equipment','PPE','Hygiene','Laboratory','Emergency',];
  statuses: string[] = ['All Status','In Stock','Low Stock','Out of Stock','Expired',];
  // Selected Item for Add/Edit
  selectedItem: InventoryItem = this.getEmptyItem();

  // File Upload
  selectedFile: File | null = null;

  // Subscriptions
  private updateSubscription?: Subscription;
  constructor(@Inject(DOCUMENT) private doc: Document,@Inject(PLATFORM_ID) private platformId: any, private authService:AuthService,private location:Location) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('userRole');
      this.loadInitialData();
      this.startRealTimeUpdates();
      this.subscribeToInventory();
      this.subscribeToMetrics();
    }
  }

  ngOnDestroy(): void {if (this.updateSubscription) {this.updateSubscription.unsubscribe();}}
  // Initial Data Load
  private loadInitialData(): void {
    this.authService.getAllInventory().subscribe({
      next:(data: InventoryItem[])=>{
          this.inventorySubject.next(data);
          this.updateMetrics();
          this.applyFilters();
      },
      error: (err) => console.error('Data load failed:', err)
    })
  }
  
  // Real-time Updates Simulation
  private startRealTimeUpdates(): void {
    this.updateSubscription = interval(15000).subscribe(() => {
      const items = this.inventorySubject.value;
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        const updatedItems = [...items];
        const item = updatedItems[randomIndex];

        const change = Math.floor(Math.random() * 10) - 5;
        const newQuantity = Math.max(0, item.quantity + change);

        updatedItems[randomIndex] = {
          ...item,
          quantity: newQuantity,
          status: this.calculateStatus(
            newQuantity,
            item.minStock,
            item.expiryDate
          ),
          lastUpdated: new Date(),
        };

        this.inventorySubject.next(updatedItems);
        this.updateMetrics();
        this.applyFilters();
      }
    });
  }

  // Subscribe to Inventory
  private subscribeToInventory(): void {this.inventory$.subscribe((items) => {this.filteredInventory = items;});}
  // Subscribe to Metrics
  private subscribeToMetrics(): void {this.metrics$.subscribe((metrics) => {this.metrics = metrics; });}

  // Update Metrics
 private updateMetrics(): void {
  const items = this.inventorySubject.value;
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const metrics: DashboardMetrics = {
    totalItems: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    totalValue: items.reduce(
      (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
      0
    ),
    
    lowStockCount: items.filter(
      (item) => Number(item.quantity) > 0 && Number(item.quantity) <= Number(item.minStock)
    ).length,
    
    expiredCount: items.filter((item) => new Date(item.expiryDate) < today).length,
    
    nearExpiryCount: items.filter((item) => {
      const expiry = new Date(item.expiryDate);
      return expiry >= today && expiry <= thirtyDaysFromNow;
    }).length,
    
    outOfStockCount: items.filter((item) => Number(item.quantity) === 0).length,
  };

  this.metricsSubject.next(metrics);
}

  // Calculate Item Status
  private calculateStatus(quantity: number,minStock: number,expiryDate: string): 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired' {const today = new Date();const expiry = new Date(expiryDate);if (expiry < today) return 'Expired';if (quantity === 0) return 'Out of Stock';if (quantity <= minStock) return 'Low Stock'; return 'In Stock';}
  // Apply Filters
  applyFilters(): void {
    let filtered = this.inventorySubject.value;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.supplier.toLowerCase().includes(term) ||
          item.batchNumber.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(
        (item) => item.category === this.selectedCategory
      );
    }

    if (this.selectedStatus !== 'All Status') {
      filtered = filtered.filter(
        (item) => this.getStatusText(item) === this.selectedStatus
      );
    }

    filtered = this.sortItems(filtered, this.sortBy);
    this.filteredInventory = filtered;

    this.updatePagination();
  }

  // Pagination
  updatePagination(): void {this.totalPages = Math.ceil(this.filteredInventory.length / this.itemsPerPage);if (this.currentPage > this.totalPages) {this.currentPage = 1;}const startIndex = (this.currentPage - 1) * this.itemsPerPage;const endIndex = startIndex + this.itemsPerPage;this.paginatedInventory = this.filteredInventory.slice(startIndex,endIndex);}
  nextPage(): void {if (this.currentPage < this.totalPages) {this.currentPage++;this.updatePagination(); }}
  previousPage(): void {if (this.currentPage > 1) {this.currentPage--;this.updatePagination(); }}
  goToPage(page: number): void {this.currentPage = page;this.updatePagination();}
  getPageNumbers(): number[] {const pages: number[] = [];const maxPages = 5;let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));let endPage = Math.min(this.totalPages, startPage + maxPages - 1);if (endPage - startPage < maxPages - 1) {startPage = Math.max(1, endPage - maxPages + 1);}for (let i = startPage; i <= endPage; i++) {pages.push(i);}return pages;}
  // Sort Items
  private sortItems(items: InventoryItem[], sortBy: string): InventoryItem[] {return items.sort((a, b) => {switch (sortBy) {case 'name':return a.name.localeCompare(b.name);case 'quantity':return b.quantity - a.quantity;case 'price':return b.price - a.price;case 'expiryDate':return (new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());default:return 0;}});}
  // Get Status Class
  getStatusClass(item: InventoryItem): string {const status = this.getStatusText(item);switch (status) {case 'In Stock':return 'bg-success';case 'Low Stock':return 'bg-warning';case 'Out of Stock':return 'bg-danger';case 'Expired':return 'bg-secondary';default:return 'bg-primary'; }}
  // Get Status Text
  getStatusText(item: InventoryItem): string {return this.calculateStatus(item.quantity, item.minStock, item.expiryDate);}
  // Modal Operations
  openAddModal(): void {this.isEditMode = false;this.selectedItem = this.getEmptyItem();this.showAddModal = true;}
  closeAddModal(): void {this.showAddModal = false;this.selectedItem = this.getEmptyItem();}
  openEditModal(item: InventoryItem): void { this.isEditMode = true; this.selectedItem = { ...item }; this.showEditModal = true;}
  closeEditModal(): void {this.showEditModal = false;this.selectedItem = this.getEmptyItem();}
  openUploadModal(): void {this.showUploadModal = true;this.selectedFile = null}
  closeUploadModal(): void {this.showUploadModal = false;this.selectedFile = null;}
  // CRUD Operations
  addItem(): void {const items = this.inventorySubject.value;const newItem: InventoryItem = {...this.selectedItem,id: Math.max(...items.map((i) => i.id), 0) + 1,lastUpdated: new Date(),status: this.calculateStatus(this.selectedItem.quantity,this.selectedItem.minStock,this.selectedItem.expiryDate),};this.inventorySubject.next([...items, newItem]);this.updateMetrics();this.applyFilters();this.closeAddModal();}
  updateItem(): void {const items = this.inventorySubject.value;const updatedItems = items.map((item) =>item.id === this.selectedItem.id? {...this.selectedItem,lastUpdated: new Date(),status: this.calculateStatus(this.selectedItem.quantity,this.selectedItem.minStock,this.selectedItem.expiryDate),}: item);this.inventorySubject.next(updatedItems);this.updateMetrics();this.applyFilters(); this.closeEditModal();}
  deleteItem(id: number): void {if (confirm('Are you sure you want to delete this item?')) {const items = this.inventorySubject.value;this.inventorySubject.next(items.filter((item) => item.id !== id));this.updateMetrics();this.applyFilters();}}
  // File Upload Operations
  onFileSelected(event: any): void {this.selectedFile = event.target.files[0];}
  goBack(): void {this.location.back();}
  async uploadExcel(): Promise<void> {
    if (!this.selectedFile) {alert('Please select a file first!');return;}
    // Simple Excel/CSV parser
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const rows = text.split('\n');
      const items = this.inventorySubject.value;
      let maxId = Math.max(...items.map((i) => i.id), 0);

      const newItems: InventoryItem[] = [];

      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = row.split(',');
        if (cols.length < 8) continue;

        maxId++;
        const newItem: InventoryItem = {
          id: maxId,
          name: cols[0]?.trim() || '',
          category: cols[1]?.trim() || 'Medical Supplies',
          quantity: parseInt(cols[2]) || 0,
          minStock: parseInt(cols[3]) || 0,
          unit: cols[4]?.trim() || 'Piece',
          price: parseFloat(cols[5]) || 0,
          expiryDate: cols[6]?.trim() || '',
          supplier: cols[7]?.trim() || '',
          batchNumber: cols[8]?.trim() || `BTH-${Date.now()}`,
          location: cols[9]?.trim() || '',
          reorderPoint: parseInt(cols[10]) || 0,
          lastUpdated: new Date(),
          status: 'In Stock',
        };

        newItem.status = this.calculateStatus(newItem.quantity,newItem.minStock,newItem.expiryDate);
        newItems.push(newItem);
      }

      this.inventorySubject.next([...items, ...newItems]);
      this.updateMetrics();
      this.applyFilters();
      this.closeUploadModal();
      alert(`Successfully uploaded ${newItems.length} items!`);
    };

    reader.readAsText(this.selectedFile);
  }

  downloadTemplate(): void {
    const headers = ['Name','Category','Quantity','Min Stock','Unit','Price','Expiry Date (YYYY-MM-DD)','Supplier','Batch Number','Location','Reorder Point',];
    const sampleData = ['Surgical Gloves,Medical Supplies,100,50,Box,450,2025-12-15,MedSupply Inc,BTH-001,Shelf A-1,75','Paracetamol 500mg,Medicines,200,100,Strip,25,2026-03-10,Pharma Solutions,BTH-002,Cabinet C-1,150',];
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Export to CSV
  exportToCSV(): void {
    const items = this.filteredInventory;
    const headers = ['ID','Name','Category','Quantity','Unit','Min Stock','Price','Expiry Date','Supplier','Batch Number','Status','Location','Reorder Point',];
    const csvData = items.map((item) => [item.id,item.name,item.category,item.quantity,item.unit,item.minStock,item.price,item.expiryDate,item.supplier,item.batchNumber,this.getStatusText(item),item.location || 'N/A',item.reorderPoint || 'N/A',]);
    const csvContent = [headers.join(','),...csvData.map((row) => row.join(',')),].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  // Helper: Empty Item
  private getEmptyItem(): InventoryItem {return {id: 0,name: '',category: '',quantity: 0,minStock: 0,unit: '',price: 0,expiryDate: '',supplier: '',batchNumber: '',lastUpdated: new Date(),status: 'In Stock',location: '',reorderPoint: 0,};}
}
