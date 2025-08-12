document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('restaurants-table')
    const form = document.getElementById('restaurant-form')
    const cancelBtn = document.getElementById('cancel-btn')
    const formTitle = document.getElementById('form-title')
    const hiddenId = document.getElementById('restaurant-id')
    const API_BASE = `${location.protocol}//${location.hostname}:5000`
    
    const badge = (open) => `<span class="px-2 py-1 rounded-full text-xs ${open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${open ? 'Open' : 'Closed'}</span>`
    
    async function loadRestaurants() {
        const res = await fetch(`${API_BASE}/restaurants`)
        const items = await res.json()
        tableBody.innerHTML = items.map(r => `
            <tr class="border-t" data-id="${r.id}">
                <td class="px-4 py-2">${r.id}</td>
                <td class="px-4 py-2 font-medium">${r.name || ''}</td>
                <td class="px-4 py-2">${r.cuisine || ''}</td>
                <td class="px-4 py-2">${badge(!!r.is_open)}</td>
                <td class="px-4 py-2">${r.price_range || ''}</td>
                <td class="px-4 py-2">${r.rating ?? ''}</td>
                <td class="px-4 py-2">${r.number_of_reviews ?? 0}</td>
                <td class="px-4 py-2 space-x-2">
                    <button class="text-blue-600 edit-btn">Edit</button>
                    <button class="text-red-600 delete-btn">Delete</button>
                </td>
            </tr>
        `).join('')
    }
        
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const currentId = (hiddenId.value || '').trim()
        const payload = {
            name: document.getElementById('name').value,
            cuisine: document.getElementById('cuisine').value,
            is_open: document.getElementById('is_open').checked,
            price_range: document.getElementById('price_range').value,
            rating: parseFloat(document.getElementById('rating').value || '0') || 0,
            number_of_reviews: parseInt(document.getElementById('number_of_reviews').value || '0', 10) || 0
        }
        if (currentId) {
            await fetch(`${API_BASE}/restaurants/${currentId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            })
        } else {
            await fetch(`${API_BASE}/restaurants`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            })
        }
        resetForm()
        await loadRestaurants()
    })
        
    cancelBtn.addEventListener('click', resetForm)
    
    function resetForm() {
        form.reset()
        hiddenId.value = ''
        formTitle.textContent = 'Add New Restaurant'
    }
    
    tableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr[data-id]')
        if (!row) return
        const id = row.getAttribute('data-id')
        if (e.target.classList.contains('edit-btn')) {
            const res = await fetch(`${API_BASE}/restaurants/${id}`)
            const item = await res.json()
            hiddenId.value = item.id
            document.getElementById('name').value = item.name || ''
            document.getElementById('cuisine').value = item.cuisine || ''
            document.getElementById('is_open').checked = !!item.is_open
            document.getElementById('price_range').value = item.price_range || '$'
            document.getElementById('rating').value = item.rating ?? ''
            document.getElementById('number_of_reviews').value = item.number_of_reviews ?? ''
            formTitle.textContent = 'Edit Restaurant'
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Delete this restaurant?')) {
                await fetch(`${API_BASE}/restaurants/${id}`, { method: 'DELETE' })
                await loadRestaurants()
            }
        }
    })
    
    loadRestaurants()
})
