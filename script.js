document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('restaurants-table')
    const form = document.getElementById('restaurant-form')
    const cancelBtn = document.getElementById('cancel-btn')
    const formTitle = document.getElementById('form-title')

    let editingId = null

    function badge(open) {
        return `<span class="px-2 py-1 rounded-full text-xs ${open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${open ? 'Open' : 'Closed'}</span>`
    }

    function loadRestaurants() {
        fetch('http://localhost:3000/restaurants')
            .then(r => r.json())
            .then(items => {
                tableBody.innerHTML = items.map(r => `
                    <tr class="border-t">
                        <td class="px-4 py-2">${r.id}</td>
                        <td class="px-4 py-2 font-medium">${r.name || ''}</td>
                        <td class="px-4 py-2">${r.cuisine || ''}</td>
                        <td class="px-4 py-2">${badge(!!r.is_open)}</td>
                        <td class="px-4 py-2">${r.price_range || ''}</td>
                        <td class="px-4 py-2">${r.rating ?? ''}</td>
                        <td class="px-4 py-2">${r.number_of_reviews ?? 0}</td>
                        <td class="px-4 py-2 space-x-2">
                            <button class="text-blue-600" onclick="editRestaurant('${r.id}')">Edit</button>
                            <button class="text-red-600" onclick="deleteRestaurant('${r.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')
            })
    }

    form.addEventListener('submit', e => {
        e.preventDefault()
        const payload = {
            name: document.getElementById('name').value,
            cuisine: document.getElementById('cuisine').value,
            is_open: document.getElementById('is_open').checked,
            price_range: document.getElementById('price_range').value,
            rating: parseFloat(document.getElementById('rating').value || '0') || 0,
            number_of_reviews: parseInt(document.getElementById('number_of_reviews').value || '0', 10) || 0
        }

        if (editingId) {
            fetch(`http://localhost:3000/restaurants/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => { resetForm(); loadRestaurants() })
        } else {
            fetch('http://localhost:3000/restaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => { resetForm(); loadRestaurants() })
        }
    })

    cancelBtn.addEventListener('click', resetForm)

    function resetForm() {
        form.reset()
        editingId = null
        formTitle.textContent = 'Add New Restaurant'
    }

    loadRestaurants()
})

function editRestaurant(id) {
    fetch(`http://localhost:3000/restaurants/${id}`)
        .then(r => r.json())
        .then(item => {
            document.getElementById('restaurant-id').value = item.id
            document.getElementById('name').value = item.name || ''
            document.getElementById('cuisine').value = item.cuisine || ''
            document.getElementById('is_open').checked = !!item.is_open
            document.getElementById('price_range').value = item.price_range || '$'
            document.getElementById('rating').value = item.rating ?? ''
            document.getElementById('number_of_reviews').value = item.number_of_reviews ?? ''
            document.getElementById('form-title').textContent = 'Edit Restaurant'
            window.editingId = id
        })
}

function deleteRestaurant(id) {
    if (confirm('Delete this restaurant?')) {
        fetch(`http://localhost:3000/restaurants/${id}`, { method: 'DELETE' })
            .then(() => window.location.reload())
    }
}
