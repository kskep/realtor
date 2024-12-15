<script>
    import AddPropertyButton from '$lib/components/AddPropertyButton.svelte';
    import EditButton from '$lib/components/EditButton.svelte';
    import { onMount } from 'svelte';

    let properties = [];
    let clients = [];
    let showModal = false;
    let selectedProperty = null;

    onMount(async () => {
        await fetchProperties();
        await fetchClients();
    });

    async function fetchProperties() {
        try {
            const response = await fetch('/api/properties');
            if (response.ok) {
                properties = await response.json();
            } else {
                console.error('Failed to fetch properties');
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    }

    async function fetchClients() {
        try {
            const response = await fetch('/api/clients');
            if (response.ok) {
                clients = await response.json();
            } else {
                console.error('Failed to fetch clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    }

    async function handleDelete(propertyId) {
        if (!confirm('Are you sure you want to delete this property?')) return;

        try {
            const response = await fetch(`/api/properties/${propertyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchProperties();
                alert('Property deleted successfully!');
            } else {
                const errorData = await response.json();
                alert(`Failed to delete property: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    }

    async function handleEdit(property) {
        selectedProperty = property;
        showModal = true;
    }

    function handlePropertyAdded() {
        fetchProperties();
    }

    function closeModal() {
        showModal = false;
    }

    async function handleSubmitEdit(event) {
        event.preventDefault();
        try {
            const response = await fetch(`/api/properties/${selectedProperty.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedProperty)
            });

            if (response.ok) {
                await fetchProperties();
                showModal = false;
                alert('Property updated successfully!');
            } else {
                const errorData = await response.json();
                alert(`Failed to update property: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating property:', error);
            alert('Failed to update property');
        }
    }
</script>
<div class="space-y-6">
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Properties
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <AddPropertyButton {clients} on:propertyAdded={handlePropertyAdded} />
      </div>
    </div>

    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Client</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each properties as property}
                <tr>
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {property.title}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {property.location}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${property.price.toLocaleString()}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      {property.status === 'Available' ? 'bg-green-100 text-green-800' :
                      property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}">
                      {property.status}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {#if property.client}
                      {property.client.firstName} {property.client.lastName}
                    {:else}
                      <span class="text-gray-400">No client assigned</span>
                    {/if}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button
                      class="text-primary-600 hover:text-primary-900 mr-4"
                      on:click={() => handleEdit(property)}
                    >
                      Edit
                    </button>
                    <button
                      class="text-red-600 hover:text-red-900"
                      on:click={() => handleDelete(property.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>