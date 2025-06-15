// script.js for /product/summary

document.addEventListener('DOMContentLoaded', async () => {
    const productSummaryTableBody = document.getElementById('product-summary-table-body');
    const loadingMessage = document.getElementById('loading-message');
    const noResultsMessage = document.getElementById('no-results');

    // Mock data based on your SQL query results
    const mockProductData = [
        {
            p_id: 1,
            p_name: "Protein Powder (Whey)",
            total_unit_sold: 150,
            total_revenue: 7500000, // Example: 7,500,000 IDR
            current_stock: 50
        },
        {
            p_id: 2,
            p_name: "Creatine Monohydrate",
            total_unit_sold: 80,
            total_revenue: 1600000, // Example: 1,600,000 IDR
            current_stock: 20
        },
        {
            p_id: 3,
            p_name: "Pre-Workout Supplement",
            total_unit_sold: 120,
            total_revenue: 3000000, // Example: 3,000,000 IDR
            current_stock: 30
        },
        {
            p_id: 4,
            p_name: "Gym Gloves",
            total_unit_sold: 200,
            total_revenue: 1000000, // Example: 1,000,000 IDR
            current_stock: 100
        },
        {
            p_id: 5,
            p_name: "Resistance Bands Set",
            total_unit_sold: 40,
            total_revenue: 800000, // Example: 800,000 IDR
            current_stock: 10
        },
        // Example of a product with no sales yet
        {
            p_id: 6,
            p_name: "Yoga Mat",
            total_unit_sold: 0,
            total_revenue: 0,
            current_stock: 25
        }
    ];

    try {
        const products = await new Promise(resolve => setTimeout(() => resolve(mockProductData), 500)); // Simulate 0.5-second delay

        loadingMessage.classList.add('hidden'); // Hide loading message

        if (products.length === 0) {
            noResultsMessage.classList.remove('hidden');
        } else {
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.p_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.total_unit_sold}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp ${product.total_revenue.toLocaleString('id-ID')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.current_stock}</td>
                `;
                productSummaryTableBody.appendChild(row);
            });
        }

    } catch (error) {
        console.error('Error loading product summary:', error);
        loadingMessage.textContent = 'Failed to load product data. Please try again later.';
        loadingMessage.classList.remove('hidden');
        noResultsMessage.classList.add('hidden');
    }
});