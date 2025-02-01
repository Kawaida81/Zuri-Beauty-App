// Temporary data for frontend testing
const mockProducts = [
    { id: '1', name: 'Shampoo', category: 'hair', price: 500, stock: 15, description: 'Premium hair shampoo' },
    { id: '2', name: 'Face Cream', category: 'skin', price: 1200, stock: 8, description: 'Moisturizing face cream' },
    { id: '3', name: 'Nail Polish', category: 'nails', price: 300, stock: 20, description: 'Long-lasting nail polish' }
];

const mockActivities = [
    { id: '1', description: 'Added new product: Shampoo', timestamp: new Date().toISOString() },
    { id: '2', description: 'Updated stock: Face Cream', timestamp: new Date().toISOString() }
];

// Add mock sales data
const mockProductSales = [
    {
        id: '1',
        date: new Date().toISOString().split('T')[0],
        product: 'Shampoo',
        quantity: 2,
        price: 500,
        discount: 0,
        total: 1000,
        payment: 'cash'
    }
];

const mockServiceSales = [
    {
        id: '1',
        date: new Date().toISOString().split('T')[0],
        service: 'Hair Styling',
        client: 'Jane Doe',
        price: 2000,
        discount: 10,
        total: 1800,
        payment: 'mpesa'
    }
];

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const navItems = document.querySelectorAll('.nav-item');
    const logoutButton = document.querySelector('.logout-nav-item');
    
    // Add logout functionality
    logoutButton.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        }
    });

    // DOM Elements
    const productModal = document.getElementById('productModal');
    const salesModal = document.getElementById('salesModal');
    const stockModal = document.getElementById('stockModal');
    const productForm = document.getElementById('productForm');
    const salesForm = document.getElementById('salesForm');
    const stockForm = document.getElementById('stockForm');
    const addProductBtn = document.getElementById('addProductBtn');
    const addServiceBtn = document.getElementById('addServiceBtn');
    const lowStockList = document.getElementById('lowStockList');
    const activitiesList = document.getElementById('activitiesList');
    const todayBookings = document.getElementById('todayBookings');
    const workerName = document.getElementById('workerName');
    const todaySales = document.getElementById('todaySales');
    const topProduct = document.getElementById('topProduct');

    // Products section elements
    let currentProducts = [...mockProducts];
    const productsSearchInput = document.getElementById('productSearch');
    const productsCategoryFilter = document.getElementById('categoryFilter');
    const productsListContainer = document.getElementById('productsList');

    // Set default date filter to today
    const salesDateFilter = document.getElementById('salesDateFilter');
    if (salesDateFilter) {
        salesDateFilter.valueAsDate = new Date();
    }

    // Add event listeners for sales filters
    if (salesDateFilter) {
        salesDateFilter.addEventListener('change', loadSalesData);
    }
    const salesPaymentFilter = document.getElementById('salesPaymentFilter');
    if (salesPaymentFilter) {
        salesPaymentFilter.addEventListener('change', loadSalesData);
    }

    // Sales Management
    const salesTabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const newProductSaleBtn = document.getElementById('newProductSaleBtn');
    const newServiceSaleBtn = document.getElementById('newServiceSaleBtn');

    // Tab switching
    salesTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            salesTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update visible content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}Tab`) {
                    content.classList.add('active');
                }
            });

            // Reload sales data
            loadSalesData();
        });
    });

    // Sales buttons handlers
    if (newProductSaleBtn) {
        newProductSaleBtn.addEventListener('click', () => {
            showModal(salesModal);
            // Update sales form for products
            document.querySelector('.modal-header h3').textContent = 'Record Product Sale';
            populateProductSelect();
        });
    }

    if (newServiceSaleBtn) {
        newServiceSaleBtn.addEventListener('click', () => {
            showModal(salesModal);
            // Update sales form for services
            document.querySelector('.modal-header h3').textContent = 'Record Service Sale';
            populateServiceSelect();
        });
    }

    function populateProductSelect() {
        const saleProduct = document.getElementById('saleProduct');
        if (saleProduct) {
            saleProduct.innerHTML = mockProducts
                .filter(p => !p.category.includes('service'))
                .map(p => `<option value="${p.id}">${p.name} - Ksh ${p.price}</option>`)
                .join('');
        }
    }

    function populateServiceSelect() {
        const saleProduct = document.getElementById('saleProduct');
        if (saleProduct) {
            saleProduct.innerHTML = mockProducts
                .filter(p => p.category.includes('service'))
                .map(p => `<option value="${p.id}">${p.name} - Ksh ${p.price}</option>`)
                .join('');
        }
    }

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            console.log('Clicked section:', section);

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Switch section
            updateSection(section);
        });
    });

    // Products section event listeners
    if (productsSearchInput) {
        productsSearchInput.addEventListener('input', filterProducts);
    }

    if (productsCategoryFilter) {
        productsCategoryFilter.addEventListener('change', filterProducts);
    }

    function filterProducts() {
        const searchTerm = productsSearchInput.value.toLowerCase();
        const category = productsCategoryFilter.value.toLowerCase();
        const sortBy = document.getElementById('sortFilter').value;
        const priceRange = document.getElementById('priceFilter').value;
        const stockStatus = document.getElementById('stockFilter').value;

        let filteredProducts = mockProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const categoryMatch = !category || product.category === category;
            const priceMatch = matchPriceRange(product.price, priceRange);
            const stockMatch = matchStockStatus(product.stock, stockStatus);
            return nameMatch && categoryMatch && priceMatch && stockMatch;
        });

        // Apply sorting
        filteredProducts = sortProducts(filteredProducts, sortBy);

        renderProducts(filteredProducts);
        updateFilterStats(filteredProducts);
        updateProductStatistics(mockProducts); // Keep showing stats for all products
    }

    function matchPriceRange(price, range) {
        if (!range) return true;
        const [min, max] = range.split('-').map(Number);
        return price >= min && (!max || price <= max);
    }

    function matchStockStatus(stock, status) {
        if (!status) return true;
        switch (status) {
            case 'out':
                return stock === 0;
            case 'low':
                return stock > 0 && stock <= 10;
            case 'adequate':
                return stock > 10;
            default:
                return true;
        }
    }

    function sortProducts(products, sortBy) {
        switch (sortBy) {
            case 'name-asc':
                return [...products].sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return [...products].sort((a, b) => b.name.localeCompare(a.name));
            case 'price-asc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...products].sort((a, b) => b.price - a.price);
            case 'stock-asc':
                return [...products].sort((a, b) => (a.stock || 0) - (b.stock || 0));
            case 'stock-desc':
                return [...products].sort((a, b) => (b.stock || 0) - (a.stock || 0));
            default:
                return products;
        }
    }

    function updateFilterStats(filteredProducts) {
        const statsContainer = document.querySelector('.filter-stats');
        if (!statsContainer) return;

        const total = mockProducts.length;
        const filtered = filteredProducts.length;
        const activeFilters = countActiveFilters();

        statsContainer.innerHTML = `
            <div class="stats-info">
                <span>Showing ${filtered} of ${total} items</span>
                ${activeFilters > 0 ? `<span>(${activeFilters} active filters)</span>` : ''}
            </div>
            <button class="clear-filters-btn" ${activeFilters === 0 ? 'disabled' : ''}>
                Clear All Filters
            </button>
        `;

        // Add clear filters functionality
        const clearBtn = statsContainer.querySelector('.clear-filters-btn');
        if (clearBtn && !clearBtn.disabled) {
            clearBtn.addEventListener('click', clearAllFilters);
        }
    }

    function countActiveFilters() {
        let count = 0;
        if (productsSearchInput.value) count++;
        if (productsCategoryFilter.value) count++;
        if (document.getElementById('priceFilter').value) count++;
        if (document.getElementById('stockFilter').value) count++;
        if (document.getElementById('sortFilter').value) count++;
        return count;
    }

    function clearAllFilters() {
        productsSearchInput.value = '';
        productsCategoryFilter.value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('stockFilter').value = '';
        document.getElementById('sortFilter').value = '';
        filterProducts();
    }

    function updateSection(section) {
        console.log('Updating section to:', section);

        // Get all sections
        const sections = {
            dashboard: document.querySelector('.main-content'),
            sales: document.querySelector('.sales-page'),
            stock: document.querySelector('.stock-page'),
            bookings: document.querySelector('.bookings-page'),
            products: document.querySelector('.products-page')
        };

        // Hide all sections first
        Object.values(sections).forEach(section => {
            if (section) {
                section.style.display = 'none';
            }
        });

        // Show the appropriate section and render content
        switch(section) {
            case 'dashboard':
                if (sections.dashboard) {
                    sections.dashboard.style.display = 'block';
                    renderDashboard();
                }
                break;
            case 'products':
                if (sections.products) {
                    sections.products.style.display = 'block';
                    renderProducts(mockProducts);
                    updateProductStatistics(mockProducts);
                }
                break;
            case 'sales':
                if (sections.sales) {
                    sections.sales.style.display = 'block';
                    renderSales();
                }
                break;
            case 'bookings':
                if (sections.bookings) {
                    sections.bookings.style.display = 'block';
                    renderBookings();
                    loadBookingsData();
                }
                break;
            case 'stock':
                if (sections.stock) {
                    sections.stock.style.display = 'block';
                    renderStock();
                }
                break;
            default:
                if (sections.dashboard) {
                    sections.dashboard.style.display = 'block';
                }
                break;
        }
    }

    // Modal Management
    function showModal(modal) {
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }

    function hideModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            if (modal === productModal && productForm) {
                productForm.reset();
            }
        }
    }

    // Close modals when clicking outside
    [productModal, salesModal, stockModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) hideModal(modal);
            });

            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => hideModal(modal));
            }

            const cancelBtn = modal.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => hideModal(modal));
            }
        }
    });

    // Button Event Listeners
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log('Add Product button clicked');
            if (productForm) {
                productForm.reset();
                document.getElementById('modalTitle').textContent = 'Add Product';
                
                // Show stock field and make it required
                const stockField = document.getElementById('productStock').parentElement;
                if (stockField) {
                    stockField.style.display = 'block';
                    document.getElementById('productStock').required = true;
                }

                // Update category options for products
                const categorySelect = document.getElementById('productCategory');
                if (categorySelect) {
                    categorySelect.innerHTML = `
                        <option value="hair">Hair Care</option>
                        <option value="skin">Skin Care</option>
                        <option value="nails">Nail Care</option>
                        <option value="makeup">Makeup</option>
                    `;
                }

                // Show the modal
                showModal(productModal);
            }
        });
    }

    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            if (productForm) {
                productForm.reset();
                document.getElementById('modalTitle').textContent = 'Add Service';
                
                // Hide stock field and make it not required
                const stockField = document.getElementById('productStock').parentElement;
                stockField.style.display = 'none';
                document.getElementById('productStock').required = false;
                document.getElementById('productStock').value = '0';

                // Update category options for services
                const categorySelect = document.getElementById('productCategory');
                if (categorySelect) {
                    categorySelect.innerHTML = `
                        <option value="hair-service">Hair Services</option>
                        <option value="facial-service">Facial Services</option>
                        <option value="nail-service">Nail Services</option>
                        <option value="massage-service">Massage Services</option>
                        <option value="makeup-service">Makeup Services</option>
                    `;
                }

                // Update price label to show duration
                const priceLabel = document.querySelector('label[for="productPrice"]');
                if (priceLabel) {
                    priceLabel.innerHTML = 'Price (Ksh) <small>per session</small>';
                }
            }
            showModal(productModal);
        });
    }

    // Product Form Submission
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Product form submitted');
            
            // Get form values
            const name = document.getElementById('productName').value;
            const category = document.getElementById('productCategory').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const stock = parseInt(document.getElementById('productStock').value);
            const description = document.getElementById('productDescription').value;

            // Create new product object
            const newProduct = {
                id: (mockProducts.length + 1).toString(),
                name,
                category,
                price,
                stock,
                description,
                type: 'product'
            };

            console.log('New product:', newProduct);

            // Add to mock products array
            mockProducts.push(newProduct);

            // Add to activities
            mockActivities.unshift({
                id: (mockActivities.length + 1).toString(),
                description: `Added new product: ${name}`,
                timestamp: new Date().toISOString()
            });

            // Update the display
            renderProducts(mockProducts);
            updateProductStatistics(mockProducts);
            renderActivities(mockActivities);

            // Show success message and close modal
            showAlert('Product added successfully', 'success');
            hideModal(productModal);
        });
    }

    if (salesForm) {
        salesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Mock sale submission
            showAlert('Sale recorded successfully', 'success');
            hideModal(salesModal);
        });
    }

    if (stockForm) {
        stockForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Mock stock adjustment
            showAlert('Stock updated successfully', 'success');
            hideModal(stockModal);
        });
    }

    // Update the product modal based on category selection
    const productCategory = document.getElementById('productCategory');
    const stockField = document.getElementById('productStock').parentElement;
    
    if (productCategory && stockField) {
        productCategory.addEventListener('change', function() {
            if (this.value === 'service') {
                stockField.style.display = 'none';
                document.getElementById('productStock').value = '0';
                document.getElementById('productStock').required = false;
            } else {
                stockField.style.display = 'block';
                document.getElementById('productStock').required = true;
            }
        });
    }

    // Render Functions
    function renderDashboard() {
        // Calculate today's total sales
        const today = new Date().toISOString().split('T')[0];
        const todayProductSales = mockProductSales
            .filter(sale => sale.date === today)
            .reduce((total, sale) => total + sale.total, 0);
        const todayServiceSales = mockServiceSales
            .filter(sale => sale.date === today)
            .reduce((total, sale) => total + sale.total, 0);
        const totalSalesToday = todayProductSales + todayServiceSales;

        // Update sales summary
        const todaySalesElement = document.getElementById('todaySales');
        if (todaySalesElement) {
            todaySalesElement.textContent = `Ksh ${totalSalesToday.toLocaleString()}`;
        }

        // Find top product
        const productSales = {};
        mockProductSales.forEach(sale => {
            productSales[sale.product] = (productSales[sale.product] || 0) + sale.quantity;
        });
        const topSellingProduct = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)[0];
        
        const topProductElement = document.getElementById('topProduct');
        if (topProductElement) {
            topProductElement.textContent = topSellingProduct ? topSellingProduct[0] : '-';
        }
        
        // Render low stock alerts
        const lowStockList = document.getElementById('lowStockList');
        if (lowStockList) {
            const lowStockItems = mockProducts.filter(p => !p.category.includes('service') && p.stock <= 10);
            if (lowStockItems.length === 0) {
                lowStockList.innerHTML = '<p class="empty-state">No low stock items</p>';
            } else {
                lowStockList.innerHTML = lowStockItems.map(product => `
                    <div class="list-item">
                        <div class="list-item-content">
                            <div class="list-item-title">${product.name}</div>
                            <div class="list-item-subtitle">
                                Current Stock: <span class="stock-level low-stock">${product.stock} units</span>
                            </div>
                        </div>
                        <div class="list-item-actions">
                            <button class="action-btn adjust-stock" data-id="${product.id}" title="Adjust Stock">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `).join('');

                // Add event listeners to adjust stock buttons
                lowStockList.querySelectorAll('.adjust-stock').forEach(button => {
                    button.addEventListener('click', () => {
                        const productId = button.dataset.id;
                        const product = mockProducts.find(p => p.id === productId);
                        if (product) {
                            document.getElementById('stockProductName').value = product.name;
                            document.getElementById('stockProductId').value = product.id;
                            document.getElementById('currentStock').value = product.stock;
                            document.getElementById('stockAdjustment').value = '';
                            document.getElementById('adjustmentReason').value = 'restock';
                            document.getElementById('adjustmentNotes').value = '';
                            showModal(stockModal);
                        }
                    });
                });
            }
        }

        // Render today's bookings
        const todayBookingsList = document.getElementById('todayBookings');
        if (todayBookingsList) {
            // Filter today's bookings from mock data
            const todayBookings = [
                {
                    id: '1',
                    service: 'Hair Styling',
                    client: 'Jane Doe',
                    time: '10:00 AM',
                    status: 'pending'
                },
                {
                    id: '2',
                    service: 'Manicure',
                    client: 'Alice Smith',
                    time: '2:30 PM',
                    status: 'confirmed'
                }
            ];

            if (todayBookings.length === 0) {
                todayBookingsList.innerHTML = '<p class="empty-state">No bookings for today</p>';
            } else {
                todayBookingsList.innerHTML = todayBookings.map(booking => `
                    <div class="list-item">
                        <div class="list-item-content">
                            <div class="list-item-title">
                                ${booking.service}
                                <span class="list-item-time">${booking.time}</span>
                            </div>
                            <div class="list-item-subtitle">
                                Client: ${booking.client}
                            </div>
                        </div>
                        <div class="list-item-status ${booking.status}">
                            ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render recent activities
        const recentActivities = mockActivities.slice(0, 5); // Show only 5 most recent activities
        const activitiesList = document.getElementById('activitiesList');
        if (activitiesList) {
            if (recentActivities.length === 0) {
                activitiesList.innerHTML = '<p class="empty-state">No recent activities</p>';
            } else {
                activitiesList.innerHTML = recentActivities.map(activity => `
                    <div class="list-item">
                        <div class="list-item-content">
                            <div class="list-item-title">${activity.description}</div>
                            <div class="list-item-subtitle">
                                ${new Date(activity.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Add refresh functionality
        const refreshInterval = setInterval(() => {
            // Refresh dashboard data every 5 minutes
            renderDashboard();
        }, 300000); // 5 minutes in milliseconds

        // Clean up interval when switching sections
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                clearInterval(refreshInterval);
            });
        });
    }

    function renderProducts(products) {
        if (!productsListContainer) return;

        // Add enhanced tabs with counters
        productsListContainer.innerHTML = `
            <div class="products-tabs">
                <button class="tab-btn active" data-tab="products">
                    Products <span class="counter">${products.filter(p => !p.category.includes('service')).length}</span>
                </button>
                <button class="tab-btn" data-tab="services">
                    Services <span class="counter">${products.filter(p => p.category.includes('service')).length}</span>
                </button>
                <div class="batch-actions">
                    <button class="batch-btn" id="exportBtn" title="Export Data">
                        <i class="fas fa-file-export"></i>
                    </button>
                    <button class="batch-btn" id="batchDeleteBtn" title="Batch Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="tab-content active" id="productsTab">
                ${renderProductsList(products.filter(p => !p.category.includes('service')))}
            </div>
            <div class="tab-content" id="servicesTab">
                ${renderServicesList(products.filter(p => p.category.includes('service')))}
            </div>
        `;

        // Add enhanced tab switching functionality
        const tabs = productsListContainer.querySelectorAll('.tab-btn');
        const tabContents = productsListContainer.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tab.dataset.tab}Tab`) {
                        content.classList.add('active');
                        // Trigger animation
                        content.style.animation = 'none';
                        content.offsetHeight; // Trigger reflow
                        content.style.animation = 'fadeIn 0.3s ease';
                    }
                });
            });
        });

        // Add batch operation handlers
        setupBatchOperations();
        addProductActionListeners();
    }

    function setupBatchOperations() {
        const exportBtn = document.getElementById('exportBtn');
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        const selectAllCheckboxes = document.querySelectorAll('.select-all-checkbox');

        if (exportBtn) {
            exportBtn.addEventListener('click', exportData);
        }

        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', batchDelete);
            // Initially disable batch delete button
            batchDeleteBtn.disabled = true;
            batchDeleteBtn.style.opacity = '0.5';
        }

        // Setup select all functionality
        selectAllCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const container = this.closest('.tab-content');
                const itemCheckboxes = container.querySelectorAll('.item-checkbox');
                itemCheckboxes.forEach(itemCheckbox => {
                    itemCheckbox.checked = this.checked;
                });
                updateBatchButtons();
            });
        });

        // Setup individual checkbox listeners
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateBatchButtons);
        });
    }

    function updateBatchButtons() {
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        const container = document.getElementById(`${activeTab}Tab`);
        const checkedItems = container.querySelectorAll('.item-checkbox:checked');
        
        if (batchDeleteBtn) {
            batchDeleteBtn.disabled = checkedItems.length === 0;
            batchDeleteBtn.style.opacity = checkedItems.length === 0 ? '0.5' : '1';
        }

        // Update select all checkbox
        const selectAllCheckbox = container.querySelector('.select-all-checkbox');
        const allCheckboxes = container.querySelectorAll('.item-checkbox');
        if (selectAllCheckbox && allCheckboxes.length > 0) {
            selectAllCheckbox.checked = checkedItems.length === allCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedItems.length > 0 && checkedItems.length < allCheckboxes.length;
        }
    }

    function exportData() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        const container = document.getElementById(`${activeTab}Tab`);
        const checkedItems = container.querySelectorAll('.item-checkbox:checked');
        
        let itemsToExport = [];
        if (checkedItems.length > 0) {
            // Export only selected items
            checkedItems.forEach(checkbox => {
                const itemId = checkbox.closest('.list-item').dataset.id;
                const item = mockProducts.find(p => p.id === itemId);
                if (item) itemsToExport.push(item);
            });
        } else {
            // Export all items of current type
            itemsToExport = mockProducts.filter(p => 
                activeTab === 'products' ? !p.category.includes('service') : p.category.includes('service')
            );
        }

        if (itemsToExport.length === 0) {
            showAlert('No items to export', 'error');
            return;
        }

        const csvContent = generateCSV(itemsToExport);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showAlert(`Successfully exported ${itemsToExport.length} ${activeTab}`, 'success');
    }

    function batchDelete() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        const container = document.getElementById(`${activeTab}Tab`);
        const checkedItems = container.querySelectorAll('.item-checkbox:checked');
        
        if (checkedItems.length === 0) {
            showAlert('Please select items to delete', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete ${checkedItems.length} selected ${activeTab}?`)) {
            const deletedItems = [];
            checkedItems.forEach(checkbox => {
                const itemId = checkbox.closest('.list-item').dataset.id;
                const index = mockProducts.findIndex(p => p.id === itemId);
                if (index !== -1) {
                    deletedItems.push(mockProducts[index]);
                    mockProducts.splice(index, 1);
                }
            });

            // Add batch deletion to activities
            mockActivities.unshift({
                id: (mockActivities.length + 1).toString(),
                description: `Batch deleted ${deletedItems.length} ${activeTab}: ${deletedItems.map(item => item.name).join(', ')}`,
                timestamp: new Date().toISOString()
            });

            renderProducts(mockProducts);
            updateProductStatistics(mockProducts);
            renderActivities(mockActivities);
            showAlert(`Successfully deleted ${deletedItems.length} ${activeTab}`, 'success');
        }
    }

    function renderProductsList(products) {
        if (products.length === 0) {
            return '<p class="empty-state">No products found</p>';
        }

        return `
            <div class="list-header">
                <label class="checkbox-container">
                    <input type="checkbox" class="select-all-checkbox">
                    <span class="checkmark"></span>
                    Select All
                </label>
                <div class="sort-controls">
                    <select id="sortFilter" class="sort-select">
                        <option value="">Sort By</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Price (Low-High)</option>
                        <option value="price-desc">Price (High-Low)</option>
                        <option value="stock-asc">Stock (Low-High)</option>
                        <option value="stock-desc">Stock (High-Low)</option>
                    </select>
                </div>
            </div>
            ${products.map(product => `
                <div class="list-item product-item" data-id="${product.id}">
                    <div class="item-checkbox-container">
                        <label class="checkbox-container">
                            <input type="checkbox" class="item-checkbox">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="list-item-content">
                        <div class="list-item-title">
                            ${product.name}
                            <span class="list-item-price">
                                Ksh ${product.price.toLocaleString()}
                            </span>
                        </div>
                        <div class="list-item-subtitle">
                            <span class="category-badge">${formatCategoryName(product.category)}</span>
                            <span class="stock-badge ${product.stock <= 10 ? 'low-stock' : ''}">${product.stock} units</span>
                            ${product.description ? `<div class="description-text">${product.description}</div>` : ''}
                        </div>
                    </div>
                    <div class="list-item-actions">
                        <button class="action-btn edit-product" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-product" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}`;
    }

    function renderServicesList(services) {
        if (services.length === 0) {
            return '<p class="empty-state">No services found</p>';
        }

        return `
            <div class="list-header">
                <label class="checkbox-container">
                    <input type="checkbox" class="select-all-checkbox">
                    <span class="checkmark"></span>
                    Select All
                </label>
                <div class="sort-controls">
                    <select id="serviceSortFilter" class="sort-select">
                        <option value="">Sort By</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Price (Low-High)</option>
                        <option value="price-desc">Price (High-Low)</option>
                    </select>
                </div>
            </div>
            ${services.map(service => `
                <div class="list-item service-item" data-id="${service.id}">
                    <div class="item-checkbox-container">
                        <label class="checkbox-container">
                            <input type="checkbox" class="item-checkbox">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="list-item-content">
                        <div class="list-item-title">
                            ${service.name}
                            <span class="list-item-price">
                                Ksh ${service.price.toLocaleString()}
                                <small>per session</small>
                            </span>
                        </div>
                        <div class="list-item-subtitle">
                            <span class="category-badge service">${formatCategoryName(service.category)}</span>
                            ${service.description ? `<div class="description-text">${service.description}</div>` : ''}
                        </div>
                    </div>
                    <div class="list-item-actions">
                        <button class="action-btn edit-product" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-product" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}`;
    }

    function addProductActionListeners() {
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.closest('.list-item').dataset.id;
                const product = mockProducts.find(p => p.id === productId);
                if (product) {
                    document.getElementById('modalTitle').textContent = 
                        product.category.includes('service') ? 'Edit Service' : 'Edit Product';
                    document.getElementById('productName').value = product.name;
                    document.getElementById('productCategory').value = product.category;
                    document.getElementById('productPrice').value = product.price;
                    
                    const stockField = document.getElementById('productStock').parentElement;
                    if (product.category.includes('service')) {
                        stockField.style.display = 'none';
                        document.getElementById('productStock').required = false;
                        document.getElementById('productStock').value = '0';
                    } else {
                        stockField.style.display = 'block';
                        document.getElementById('productStock').required = true;
                        document.getElementById('productStock').value = product.stock;
                    }
                    
                    document.getElementById('productDescription').value = product.description || '';
                    showModal(productModal);
                }
            });
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', () => {
                const item = button.closest('.list-item');
                const productId = item.dataset.id;
                const isService = item.classList.contains('service-item');
                
                if (confirm(`Are you sure you want to delete this ${isService ? 'service' : 'product'}?`)) {
                    const index = mockProducts.findIndex(p => p.id === productId);
                    if (index !== -1) {
                        const deletedItem = mockProducts.splice(index, 1)[0];
                        mockActivities.unshift({
                            id: (mockActivities.length + 1).toString(),
                            description: `Deleted ${isService ? 'service' : 'product'}: ${deletedItem.name}`,
                            timestamp: new Date().toISOString()
                        });
                        renderProducts(mockProducts);
                        updateProductStatistics(mockProducts);
                        renderActivities(mockActivities);
                        showAlert(`${isService ? 'Service' : 'Product'} deleted successfully`, 'success');
                    }
                }
            });
        });
    }

    function renderSales() {
        const salesTableBody = document.getElementById('salesTableBody');
        if (salesTableBody) {
            salesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">No sales records yet</td>
                </tr>
            `;
        }
    }

    function renderStock() {
        const stockTableBody = document.getElementById('stockTableBody');
        if (stockTableBody) {
            stockTableBody.innerHTML = mockProducts.map(product => `
                <tr data-id="${product.id}">
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td class="stock-level ${product.stock <= 10 ? 'low-stock' : ''}">${product.stock}</td>
                    <td>
                        <button class="action-btn adjust-stock">
                            <i class="fas fa-edit"></i> Adjust
                        </button>
                    </td>
                </tr>
            `).join('');

            // Add event listeners to adjust buttons
            stockTableBody.querySelectorAll('.adjust-stock').forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.closest('tr').dataset.id;
                    const product = mockProducts.find(p => p.id === productId);
                    if (product) {
                        document.getElementById('stockProductName').value = product.name;
                        document.getElementById('stockProductId').value = product.id;
                        document.getElementById('currentStock').value = product.stock;
                        document.getElementById('stockAdjustment').value = '';
                        document.getElementById('adjustmentReason').value = 'restock';
                        document.getElementById('adjustmentNotes').value = '';
                        showModal(stockModal);
                    }
                });
            });
        }
    }

    function renderActivities(activities) {
        const activitiesList = document.getElementById('activitiesList');
        if (activitiesList) {
            activitiesList.innerHTML = activities.map(activity => `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${activity.description}</div>
                        <div class="list-item-subtitle">
                            ${new Date(activity.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Update the renderBookings function
    function renderBookings() {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;

        // Mock bookings data
        const mockBookings = [
            {
                id: '1',
                service: 'Hair Styling',
                client: 'Jane Doe',
                time: '10:00 AM',
                status: 'pending',
                date: new Date().toISOString().split('T')[0],
                notes: 'First time client'
            },
            {
                id: '2',
                service: 'Manicure',
                client: 'Alice Smith',
                time: '2:30 PM',
                status: 'confirmed',
                date: new Date().toISOString().split('T')[0],
                notes: 'Regular client - prefers quick service'
            },
            {
                id: '3',
                service: 'Facial Treatment',
                client: 'Mary Johnson',
                time: '4:00 PM',
                status: 'completed',
                date: new Date().toISOString().split('T')[0],
                notes: 'Sensitive skin'
            }
        ];

        updateBookingStatistics(mockBookings);
        displayBookings(mockBookings);
    }

    // Add new functions for bookings
    function updateBookingStatistics(bookings) {
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(booking => booking.date === today);
        
        document.getElementById('bookingsCountToday').textContent = todayBookings.length;
        document.getElementById('pendingBookings').textContent = 
            todayBookings.filter(booking => booking.status === 'pending').length;

        // Calculate most booked service
        const serviceCounts = bookings.reduce((acc, booking) => {
            acc[booking.service] = (acc[booking.service] || 0) + 1;
            return acc;
        }, {});

        const mostBooked = Object.entries(serviceCounts)
            .sort(([,a], [,b]) => b - a)[0];
        
        document.getElementById('mostBookedService').textContent = 
            mostBooked ? mostBooked[0] : '-';
    }

    function displayBookings(bookings) {
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) return;

        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p class="empty-state">No bookings found</p>';
            return;
        }

        bookingsList.innerHTML = bookings.map(booking => `
            <div class="list-item booking-item" data-id="${booking.id}">
                <div class="list-item-content">
                    <div class="list-item-title">
                        ${booking.service}
                        <span class="list-item-time">${booking.time}</span>
                    </div>
                    <div class="list-item-subtitle">
                        Client: ${booking.client}<br>
                        Notes: ${booking.notes || 'No notes'}
                    </div>
                </div>
                <div class="list-item-status ${booking.status}">
                    ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
            </div>
        `).join('');
    }

    function loadBookingsData() {
        const date = document.getElementById('bookingsDateFilter').value;
        const status = document.getElementById('bookingsStatusFilter').value;
        
        // Mock bookings data (you would typically fetch this from a server)
        const mockBookings = [
            // ... same mock data as in renderBookings ...
        ];

        const filteredBookings = mockBookings.filter(booking => {
            const dateMatch = !date || booking.date === date;
            const statusMatch = !status || booking.status === status;
            return dateMatch && statusMatch;
        });

        displayBookings(filteredBookings);
        updateBookingStatistics(mockBookings); // Use all bookings for statistics
    }

    // Add event listeners for bookings filters
    const bookingsDateFilter = document.getElementById('bookingsDateFilter');
    const bookingsStatusFilter = document.getElementById('bookingsStatusFilter');

    if (bookingsDateFilter) {
        bookingsDateFilter.valueAsDate = new Date();
        bookingsDateFilter.addEventListener('change', loadBookingsData);
    }

    if (bookingsStatusFilter) {
        bookingsStatusFilter.addEventListener('change', loadBookingsData);
    }

    // Utility Functions
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        const container = document.querySelector('.main-content');
        if (container) {
            container.insertAdjacentElement('afterbegin', alert);
            setTimeout(() => alert.remove(), 3000);
        }
    }

    // Update loadSalesData function
    function loadSalesData() {
        const date = document.getElementById('salesDateFilter').value;
        const paymentMethod = document.getElementById('salesPaymentFilter').value;
        
        // Load product sales
        const productSalesTableBody = document.getElementById('productSalesTableBody');
        if (productSalesTableBody) {
            const filteredProductSales = mockProductSales.filter(sale => {
                const dateMatch = !date || sale.date === date;
                const paymentMatch = !paymentMethod || sale.payment === paymentMethod;
                return dateMatch && paymentMatch;
            });

            if (filteredProductSales.length === 0) {
                productSalesTableBody.innerHTML = `
                    <tr><td colspan="7" class="empty-state">No product sales found</td></tr>
                `;
            } else {
                productSalesTableBody.innerHTML = filteredProductSales.map(sale => `
                    <tr>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.product}</td>
                        <td>${sale.quantity}</td>
                        <td>Ksh ${sale.price}</td>
                        <td>${sale.discount}%</td>
                        <td>Ksh ${sale.total}</td>
                        <td>${sale.payment}</td>
                    </tr>
                `).join('');
            }
        }

        // Load service sales
        const serviceSalesTableBody = document.getElementById('serviceSalesTableBody');
        if (serviceSalesTableBody) {
            const filteredServiceSales = mockServiceSales.filter(sale => {
                const dateMatch = !date || sale.date === date;
                const paymentMatch = !paymentMethod || sale.payment === paymentMethod;
                return dateMatch && paymentMatch;
            });

            if (filteredServiceSales.length === 0) {
                serviceSalesTableBody.innerHTML = `
                    <tr><td colspan="7" class="empty-state">No service sales found</td></tr>
                `;
            } else {
                serviceSalesTableBody.innerHTML = filteredServiceSales.map(sale => `
                    <tr>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.service}</td>
                        <td>${sale.client}</td>
                        <td>Ksh ${sale.price}</td>
                        <td>${sale.discount}%</td>
                        <td>Ksh ${sale.total}</td>
                        <td>${sale.payment}</td>
                    </tr>
                `).join('');
            }
        }

        // Update sales statistics
        updateSalesStatistics();
    }

    function updateSalesStatistics() {
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate today's product sales
        const todayProductSales = mockProductSales
            .filter(sale => sale.date === today)
            .reduce((total, sale) => total + sale.total, 0);
        
        // Calculate today's service sales
        const todayServiceSales = mockServiceSales
            .filter(sale => sale.date === today)
            .reduce((total, sale) => total + sale.total, 0);

        // Update statistics display
        document.getElementById('productSalesToday').textContent = `Ksh ${todayProductSales}`;
        document.getElementById('serviceSalesToday').textContent = `Ksh ${todayServiceSales}`;
        document.getElementById('totalSalesToday').textContent = `Ksh ${todayProductSales + todayServiceSales}`;

        // Update top products
        const topProducts = document.getElementById('topProducts');
        if (topProducts) {
            const productSales = {};
            mockProductSales.forEach(sale => {
                productSales[sale.product] = (productSales[sale.product] || 0) + sale.total;
            });

            const sortedProducts = Object.entries(productSales)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);

            topProducts.innerHTML = sortedProducts.map(([name, value]) => `
                <div class="item">
                    <span class="item-name">${name}</span>
                    <span class="item-value">Ksh ${value}</span>
                </div>
            `).join('') || '<p class="empty-state">No product sales data</p>';
        }

        // Update top services
        const topServices = document.getElementById('topServices');
        if (topServices) {
            const serviceSales = {};
            mockServiceSales.forEach(sale => {
                serviceSales[sale.service] = (serviceSales[sale.service] || 0) + sale.total;
            });

            const sortedServices = Object.entries(serviceSales)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);

            topServices.innerHTML = sortedServices.map(([name, value]) => `
                <div class="item">
                    <span class="item-name">${name}</span>
                    <span class="item-value">Ksh ${value}</span>
                </div>
            `).join('') || '<p class="empty-state">No service sales data</p>';
        }
    }

    // Add new function for product statistics
    function updateProductStatistics(products) {
        // Separate products and services
        const physicalProducts = products.filter(p => !p.category.includes('service'));
        const services = products.filter(p => p.category.includes('service'));

        // Update total counts with trends
        updateTotalCounts(physicalProducts, services);

        // Update inventory metrics
        updateInventoryMetrics(physicalProducts);

        // Update popular items with detailed stats
        updatePopularItems(products);

        // Update category distribution with enhanced visualization
        updateCategoryDistribution(products);

        // Update stock status with detailed breakdown
        updateStockStatus(physicalProducts);

        // Update service performance metrics
        updateServicePerformance(services);

        // Update price analytics
        updatePriceAnalytics(products);
    }

    function updateTotalCounts(products, services) {
        const productsCount = document.getElementById('totalProducts');
        const servicesCount = document.getElementById('totalServices');
        
        if (productsCount) {
            const trend = calculateTrend('products', products.length);
            productsCount.innerHTML = `
                ${products.length}
                <span class="trend ${trend.direction}">${trend.percentage}%</span>
            `;
        }
        
        if (servicesCount) {
            const trend = calculateTrend('services', services.length);
            servicesCount.innerHTML = `
                ${services.length}
                <span class="trend ${trend.direction}">${trend.percentage}%</span>
            `;
        }
    }

    function updateInventoryMetrics(products) {
        const lowStockCount = document.getElementById('lowStockCount');
        const inventoryValue = document.getElementById('inventoryValue');
        
        if (lowStockCount) {
            const lowStockItems = products.filter(p => p.stock <= 10);
            const trend = calculateTrend('lowStock', lowStockItems.length);
            lowStockCount.innerHTML = `
                ${lowStockItems.length}
                <span class="trend ${trend.direction}">${trend.percentage}%</span>
            `;
        }
        
        if (inventoryValue) {
            const totalValue = products.reduce((total, product) => {
            return total + (product.price * product.stock);
        }, 0);
            const trend = calculateTrend('inventoryValue', totalValue);
            inventoryValue.innerHTML = `
                Ksh ${totalValue.toLocaleString()}
                <span class="trend ${trend.direction}">${trend.percentage}%</span>
            `;
        }
    }

    function updatePopularItems(products) {
        const popularProduct = document.getElementById('popularProduct');
        const popularService = document.getElementById('popularService');
        
        // Calculate product popularity based on sales and views
        const productMetrics = calculatePopularityMetrics(products, false);
        const serviceMetrics = calculatePopularityMetrics(products, true);
        
        if (popularProduct && productMetrics.top) {
            popularProduct.innerHTML = `
                <div class="popular-item-details">
                    <span class="item-name">${productMetrics.top.name}</span>
                    <div class="metrics">
                        <span class="sales">Sales: ${productMetrics.top.sales}</span>
                        <span class="revenue">Revenue: Ksh ${productMetrics.top.revenue.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }
        
        if (popularService && serviceMetrics.top) {
            popularService.innerHTML = `
                <div class="popular-item-details">
                    <span class="item-name">${serviceMetrics.top.name}</span>
                    <div class="metrics">
                        <span class="bookings">Bookings: ${serviceMetrics.top.bookings}</span>
                        <span class="revenue">Revenue: Ksh ${serviceMetrics.top.revenue.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }
    }

    function calculatePopularityMetrics(products, isService) {
        const items = products.filter(p => p.category.includes('service') === isService);
        return {
            top: items.length > 0 ? {
                name: items[0].name,
                sales: Math.floor(Math.random() * 100), // Replace with actual sales data
                revenue: items[0].price * Math.floor(Math.random() * 100), // Replace with actual revenue
                bookings: Math.floor(Math.random() * 50) // Replace with actual bookings
            } : null
        };
    }

    function calculateTrend(metric, currentValue) {
        // Simulate previous value (replace with actual historical data)
        const previousValue = currentValue * (0.8 + Math.random() * 0.4);
        const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
        
        return {
            direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral',
            percentage: Math.abs(percentageChange).toFixed(1)
        };
    }

    function updateCategoryDistribution(products) {
        const categoryStats = document.getElementById('categoryDistribution');
        if (!categoryStats) return;

        const categories = groupByCategory(products);
        const maxCount = Math.max(...Object.values(categories).map(items => items.length));

        categoryStats.innerHTML = `
            <h3>Category Distribution</h3>
            ${Object.entries(categories).map(([category, items]) => {
                const percentage = (items.length / maxCount) * 100;
                const totalValue = items.reduce((sum, item) => sum + item.price * (item.stock || 1), 0);
                
                return `
                        <div class="category-item">
                            <div class="category-info">
                            <span class="category-name">${formatCategoryName(category)}</span>
                                <div class="category-details">
                                <small>${items.length} items • Ksh ${totalValue.toLocaleString()} total value</small>
                                </div>
                            </div>
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${percentage}%"></div>
                        </div>
                                </div>
                `;
            }).join('')}
        `;
    }

    function updateStockStatus(products) {
        const stockStatus = document.getElementById('stockStatus');
        if (!stockStatus) return;

            const stockLevels = {
            'Out of Stock': products.filter(p => p.stock === 0),
            'Low Stock': products.filter(p => p.stock > 0 && p.stock <= 10),
            'Adequate Stock': products.filter(p => p.stock > 10)
            };

            stockStatus.innerHTML = `
                <h3>Stock Status</h3>
            ${Object.entries(stockLevels).map(([status, items]) => {
                const percentage = (items.length / products.length) * 100;
                const statusClass = status.toLowerCase().replace(/\s+/g, '-');
                
                return `
                        <div class="stock-status-item">
                            <div class="status-info">
                                <span class="status-label">${status}</span>
                            <small>${items.length} items (${percentage.toFixed(1)}%)</small>
                        </div>
                                <div class="status-bar">
                            <div class="status-fill ${statusClass}" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                `;
            }).join('')}
        `;
    }

    function updateServicePerformance(services) {
        const performanceSection = document.getElementById('servicePerformance');
        if (!performanceSection) return;

        // Simulate performance metrics (replace with actual data)
        const metrics = {
            completed: Math.floor(services.length * 0.7),
            upcoming: Math.floor(services.length * 0.2),
            cancelled: Math.floor(services.length * 0.1)
        };

        const total = Object.values(metrics).reduce((sum, val) => sum + val, 0);

        performanceSection.innerHTML = `
                <h3>Service Performance</h3>
            ${Object.entries(metrics).map(([status, count]) => {
                const percentage = (count / total) * 100;
                return `
                        <div class="service-status-item">
                            <div class="status-info">
                            <span class="status-label">${capitalizeFirst(status)}</span>
                            <small>${count} bookings (${percentage.toFixed(1)}%)</small>
                        </div>
                                <div class="status-bar">
                            <div class="status-fill ${status}" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                `;
            }).join('')}
        `;
    }

    function updatePriceAnalytics(products) {
        const priceRanges = document.getElementById('priceRanges');
        if (!priceRanges) return;

        const ranges = calculatePriceRanges(products);
        const maxCount = Math.max(...Object.values(ranges).map(items => items.length));

            priceRanges.innerHTML = `
            <h3>Price Distribution</h3>
            ${Object.entries(ranges).map(([range, items]) => {
                const percentage = (items.length / maxCount) * 100;
                return `
                        <div class="price-range-item">
                        <div class="range-info">
                            <span class="range-label">Ksh ${range}</span>
                            <small>${items.length} items</small>
                                </div>
                            <div class="range-bar">
                            <div class="range-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                `;
            }).join('')}
        `;
    }

    function calculatePriceRanges(products) {
        const ranges = {
            '0 - 1,000': [],
            '1,001 - 5,000': [],
            '5,001 - 10,000': [],
            '10,001+': []
        };

        products.forEach(product => {
            if (product.price <= 1000) ranges['0 - 1,000'].push(product);
            else if (product.price <= 5000) ranges['1,001 - 5,000'].push(product);
            else if (product.price <= 10000) ranges['5,001 - 10,000'].push(product);
            else ranges['10,001+'].push(product);
        });

        return ranges;
    }

    function formatCategoryName(category) {
        return category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initialize dashboard view
    updateSection('dashboard');
}); 