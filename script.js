document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#restaurants-table')
    const form = document.querySelector('#restaurant-form')
    const cancelBtn = document.querySelector('#cancel-btn')
    const formTitle = document.querySelector('#form-title')
    const hiddenId = document.querySelector('#restaurant-id')
    const nameInput = document.querySelector('#name')
    const cuisineInput = document.querySelector('#cuisine')
    const isOpenInput = document.querySelector('#is_open')
    const priceRangeSelect = document.querySelector('#price_range')
    const ratingInput = document.querySelector('#rating')
    const reviewsInput = document.querySelector('#number_of_reviews')
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
            name: nameInput.value,
            cuisine: cuisineInput.value,
            is_open: isOpenInput.checked,
            price_range: priceRangeSelect.value,
            rating: parseFloat(ratingInput.value || '0') || 0,
            number_of_reviews: parseInt(reviewsInput.value || '0', 10) || 0
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
            nameInput.value = item.name || ''
            cuisineInput.value = item.cuisine || ''
            isOpenInput.checked = !!item.is_open
            priceRangeSelect.value = item.price_range || '$'
            ratingInput.value = item.rating ?? ''
            reviewsInput.value = item.number_of_reviews ?? ''
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
