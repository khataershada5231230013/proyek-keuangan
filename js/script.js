// ==========================================
// 1. MENGAMBIL ELEMEN DARI HTML (DOM Selection)
// ==========================================
const form = document.getElementById('expense-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const balanceDisplay = document.getElementById('total-amount');

const themeToggleBtn = document.getElementById('theme-toggle');
const sortSelect = document.getElementById('sort-transaction');
const ctx = document.getElementById('expense-chart').getContext('2d');
let expenseChart; 

// ==========================================
// 2. SETUP LOCAL STORAGE
// ==========================================
let transactions = JSON.parse(localStorage.getItem('transactions')) !== null 
    ? JSON.parse(localStorage.getItem('transactions')) 
    : [];

let isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) document.body.classList.add('dark-mode'); 

// ==========================================
// 3. FUNGSI INISIALISASI
// ==========================================
function init() {
    renderSortedList(); 
    updateBalance();    
    updateChart();      
}

// ==========================================
// 4. FUNGSI DARK MODE
// ==========================================
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode); 
});

// ==========================================
// FITUR BARU: FORMAT INPUT RUPIAH SAAT MENGETIK
// ==========================================
amountInput.addEventListener('input', function(e) {
    // 1. Hilangkan semua karakter yang bukan angka (termasuk titik)
    let rawValue = this.value.replace(/[^0-9]/g, '');
    
    // 2. Jika tidak kosong, ubah kembali ke format angka dengan titik
    if (rawValue !== '') {
        this.value = parseInt(rawValue, 10).toLocaleString('id-ID');
    } else {
        this.value = '';
    }
});

// ==========================================
// 5. FUNGSI CHART.JS
// ==========================================
function updateChart() {
    const categoryTotals = {
        'Makanan': 0,
        'Transportasi': 0,
        'Hiburan': 0
    };

    transactions.forEach(t => {
        if (categoryTotals[t.category] !== undefined) {
            categoryTotals[t.category] += t.amount;
        }
    });

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Makanan', 'Transportasi', 'Hiburan'],
            datasets: [{
                data: [categoryTotals['Makanan'], categoryTotals['Transportasi'], categoryTotals['Hiburan']],
                backgroundColor: ['#e74c3c', '#3498db', '#f1c40f'],
                borderWidth: 0 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' } 
            }
        }
    });
}

// ==========================================
// 6. FUNGSI SORTING & MENAMPILKAN DATA (DOM)
// ==========================================
function renderSortedList() {
    transactionList.innerHTML = '';
    const sortValue = sortSelect.value;
    let sortedTransactions = [...transactions];

    if (sortValue === 'highest') {
        sortedTransactions.sort((a, b) => b.amount - a.amount); 
    } else if (sortValue === 'newest') {
        sortedTransactions.reverse(); 
    } 

    sortedTransactions.forEach(addTransactionToDOM);
}

// ==========================================
// 7. FUNGSI LOGIKA TRANSAKSI (Tambah, Hapus, UI)
// ==========================================
function addTransaction(e) {
    e.preventDefault();

    if (itemNameInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('Mohon isi Nama Barang dan Jumlah Uang!');
        return;
    }

    // REVISI: Hilangkan titik sebelum disimpan menjadi angka murni
    // Contoh: "15.000" diubah jadi "15000" lalu dijadikan Number
    let cleanAmount = amountInput.value.replace(/\./g, '');

    const transaction = {
        id: Math.floor(Math.random() * 100000000), 
        name: itemNameInput.value,
        amount: Number(cleanAmount), // Disimpan sebagai angka murni
        category: categoryInput.value
    };

    transactions.push(transaction); 
    updateLocalStorage();           
    init();                         

    itemNameInput.value = '';
    amountInput.value = '';
}

function addTransactionToDOM(transaction) {
    const li = document.createElement('li');
    const highlightClass = transaction.amount > 50000 ? 'highlight-danger' : '';
    const formattedAmount = transaction.amount.toLocaleString('id-ID');

    li.innerHTML = `
        <div>
            <strong>${transaction.name}</strong> 
            <br> <small style="color: var(--secondary-color)">${transaction.category}</small>
        </div>
        <div style="text-align: right;">
            <span class="${highlightClass}">Rp ${formattedAmount}</span>
            <br>
            <button onclick="removeTransaction(${transaction.id})" class="btn-secondary" style="padding: 2px 8px; margin-top: 5px; font-size: 0.7rem;">Hapus</button>
        </div>
    `;

    transactionList.appendChild(li);
}

function updateBalance() {
    const total = transactions.reduce((acc, item) => (acc += item.amount), 0);
    balanceDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

window.removeTransaction = function(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init(); 
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ==========================================
// 8. EVENT LISTENERS
// ==========================================
form.addEventListener('submit', addTransaction);
sortSelect.addEventListener('change', renderSortedList); 

// Jalankan aplikasi!
init();