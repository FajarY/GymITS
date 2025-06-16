import { getTotalSpending, getReceiptHistory } from "../requestScript.js";

document.addEventListener('DOMContentLoaded', async () => {
    const totalSpendingEl = document.getElementById("total-spending-amount");
    const receiptGrid = document.querySelector(".grid.gap-6"); // Selects the receipt container

    const formatCurrency = (value) => {
        const number = parseFloat(value);
        if (isNaN(number)) return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleTotalSpending = (data) => {
        if (data.data && typeof data.data.spending !== 'undefined' && data.data.spending !== null) {
            totalSpendingEl.textContent = formatCurrency(data.data.spending);
        } else {
            totalSpendingEl.textContent = "Rp 0";
        }
    };

    const handleReceiptHistory = (data) => {
        receiptGrid.innerHTML = "";
        const receipts = data.data;
        if (!receipts || receipts.length === 0) {
            receiptGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Tidak ada riwayat struk.</p>`;
            return;
        }

        receipts.forEach(receipt => {
            const card = document.createElement('div');
            card.className = "bg-white rounded-lg shadow-md gap-4 p-6 flex flex-col";

            const itemsHtml = receipt.items.map(item => `
                <li class="flex justify-between">
                    <span class="text-sm text-gray-600">${item.name}</span>
                    <span class="text-sm font-medium text-gray-800">${formatCurrency(item.total_price)}</span>
                </li>
            `).join('');

            const calculatedTotal = receipt.items.reduce((sum, item) => sum + item.total_price, 0);

            card.innerHTML = `
                <div class="flex-col justify-between items-start">
                    <h3 class="text-lg font-bold text-[#0d141c]">Receipt #${receipt.receipt_id}</h3>
                    <p class="text-sm text-gray-500">${formatDate(receipt.receipt_date)}</p>
                </div>
                <div class="mt-4 flex-grow">
                    <h4 class="text-md font-semibold text-gray-700 mb-2">Items:</h4>
                    <ul class="space-y-2">
                        ${itemsHtml}
                    </ul>
                </div>
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="flex justify-between items-center">
                        <p class="text-md font-bold text-[#0d141c]">Total</p>
                        <p class="text-lg font-bold text-[#3490f3]">${formatCurrency(calculatedTotal)}</p>
                    </div>
                </div>
            `;
            receiptGrid.appendChild(card);
        });
    };

    totalSpendingEl.textContent = "Memuat...";
    receiptGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Memuat riwayat struk...</p>`;

    try {
        const [spendingResponse, receiptResponse] = await Promise.all([
            getTotalSpending(),
            getReceiptHistory()
        ]);
        
        const [spendingRes, spendingData] = spendingResponse;
        const [receiptRes, receiptData] = receiptResponse;
        
        if (spendingRes.ok && spendingData.status) {
            handleTotalSpending(spendingData);
        } else {
            console.error("Failed to fetch total spending:", spendingData.message);
            totalSpendingEl.textContent = 'Gagal Memuat';
        }

        if (receiptRes.ok && receiptData.status) {
            handleReceiptHistory(receiptData);
        } else {
            console.error("Failed to fetch receipt history:", receiptData.message);
            receiptGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Gagal memuat riwayat struk.</p>`;
        }

    } catch (err) {
        console.error("Error fetching page data:", err);
        totalSpendingEl.textContent = 'Gagal Memuat';
        receiptGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Terjadi kesalahan saat memuat data.</p>`;
    }
});